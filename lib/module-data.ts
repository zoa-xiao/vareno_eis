import type { ModuleDefinition } from "@/lib/erp-data";
import { formatRupiah } from "@/lib/formatters";
import { getCurrentAuthContext } from "@/lib/supabase/user-context";

export type ModuleRow = Record<string, string> & { __key: string; __sku?: string; __status?: string; __id?: string; __userId?: string; __remainingOptions?: string };
export type ModuleOption = { label: string; value: string; kind?: string; unit?: string; cost?: number; minimum?: number };
export type ModulePageData = {
  rows: ModuleRow[];
  metrics: ModuleDefinition["metrics"];
  options: Record<string, ModuleOption[]>;
  error: string | null;
  role: string;
};

type DbRow = Record<string, unknown>;
const record = (value: unknown): DbRow => value && typeof value === "object" ? value as DbRow : {};
const records = (value: unknown): DbRow[] => Array.isArray(value) ? value.map(record) : [];
const related = (value: unknown): DbRow => Array.isArray(value) ? record(value[0]) : record(value);
const str = (value: unknown, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);
const num = (value: unknown) => Number(value ?? 0);
const rupiah = (value: unknown) => formatRupiah(num(value));
const date = (value: unknown) => value ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(String(value))) : "—";
const pct = (value: number) => `${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
const row = (key: string, values: Record<string, string>, meta: Partial<ModuleRow> = {}): ModuleRow => ({ __key: key, ...values, ...meta });

function blankMetrics(definition: ModuleDefinition) {
  return definition.metrics.map((metric) => ({ ...metric, value: "—", note: "data belum dimuat" }));
}

function failed(definition: ModuleDefinition, error: string, role = ""): ModulePageData {
  return { rows: [], metrics: blankMetrics(definition), options: {}, error, role };
}

export async function getModulePageData(moduleKey: string, definition: ModuleDefinition): Promise<ModulePageData> {
  const { supabase, claims, profilePromise, error: contextError } = await getCurrentAuthContext();
  if (!supabase) return failed(definition, contextError ?? "Konfigurasi Supabase belum tersedia di server.");

  try {
    if (!claims) return failed(definition, contextError ?? "Sesi login berakhir. Silakan masuk kembali.");
    if (!profilePromise) return failed(definition, contextError ?? "Profil aktif dengan hak akses belum tersedia.");
    if (moduleKey === "products") {
      const [profileResult, productsResult, stockResult, bomCountResult, categoriesResult, bomProductsResult, materialsResult] = await Promise.all([
        profilePromise,
        supabase.from("products").select("id,name,model,active,product_categories(name),product_variants(sku,variant_name,size,color,unit_price,unit_cost,minimum_stock,active)").order("created_at", { ascending: false }),
        supabase.from("stock_balances").select("item_code,quantity").eq("item_type", "produk_jadi"),
        supabase.from("bills_of_materials").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("product_categories").select("id,name").order("name"),
        supabase.from("products").select("id,name,model").eq("active", true).order("name"),
        supabase.from("raw_materials").select("code,name,unit").eq("active", true).order("name"),
      ]);
      const { data: profile, error: profileError } = profileResult;
      if (profileError) return failed(definition, profileError.message);
      if (!profile?.active || !profile.role) return failed(definition, "Profil aktif dengan hak akses belum tersedia.");
      const role = profile.role;
      const error = productsResult.error ?? stockResult.error ?? bomCountResult.error ?? categoriesResult.error ?? bomProductsResult.error ?? materialsResult.error;
      if (error) return failed(definition, error.message, role);
      const stockBySku = new Map(records(stockResult.data).map((item) => [str(item.item_code), num(item.quantity)]));
      const products = records(productsResult.data);
      const rows = products.flatMap((product) => {
        const category = related(product.product_categories);
        const variants = records(product.product_variants);
        if (!variants.length) return [row(str(product.id), { Produk: str(product.name), "SKU / Varian": "Belum ada varian", Kategori: str(category.name), "Harga jual": "—", "Stok siap jual": "0 unit", Status: product.active ? "Aktif" : "Nonaktif" }, { __id: str(product.id) })];
        return variants.map((variant) => row(str(variant.sku), {
          Produk: str(product.name), "SKU / Varian": `${str(variant.sku)} · ${str(variant.variant_name)}`, Kategori: str(category.name),
          "Harga jual": rupiah(variant.unit_price), "Stok siap jual": `${stockBySku.get(str(variant.sku)) ?? 0} unit`, Status: variant.active ? "Aktif" : "Nonaktif",
        }, { __sku: str(variant.sku), __id: str(product.id), __status: variant.active ? "Aktif" : "Nonaktif" }));
      });
      const activeProducts = products.filter((item) => item.active).length;
      const skuCount = products.reduce((sum, item) => sum + records(item.product_variants).filter((variant) => variant.active).length, 0);
      return { rows, options: {
        categories: records(categoriesResult.data).map((item) => ({ label: str(item.name), value: str(item.name) })),
        bomProducts: records(bomProductsResult.data).map((item) => ({ label: `${str(item.name)} · ${str(item.model)}`, value: str(item.id) })),
        bomMaterials: records(materialsResult.data).map((item) => ({ label: `${str(item.name)} (${str(item.code)}) · ${str(item.unit)}`, value: str(item.code) })),
      }, error: null, role,
        metrics: [{ label: "Produk aktif", value: String(activeProducts), note: "dari katalog Supabase" }, { label: "Varian / SKU", value: String(skuCount), note: "SKU aktif" }, { label: "BOM aktif", value: String(bomCountResult.count ?? 0), note: "resep produksi" }] };
    }

    if (moduleKey === "purchases") {
      const [profileResult, ordersResult, suppliersResult, materialsResult] = await Promise.all([
        profilePromise,
        supabase.from("purchase_orders").select("id,supplier_name,order_date,total,status,purchase_order_items(id,material_code,quantity,unit_price,received_quantity,raw_materials(name,unit))").order("created_at", { ascending: false }),
        supabase.from("suppliers").select("id,name").eq("active", true).order("name"),
        supabase.from("raw_materials").select("code,name,unit,unit_cost").eq("active", true).order("name"),
      ]);
      const { data: profile, error: profileError } = profileResult;
      if (profileError) return failed(definition, profileError.message);
      if (!profile?.active || !profile.role) return failed(definition, "Profil aktif dengan hak akses belum tersedia.");
      const role = profile.role;
      const error = ordersResult.error ?? suppliersResult.error ?? materialsResult.error;
      if (error) return failed(definition, error.message, role);
      const orders = records(ordersResult.data);
      const rows = orders.map((order) => {
        const items = records(order.purchase_order_items);
        const remainingItems = items.filter((item) => num(item.received_quantity) < num(item.quantity));
        const receivedLabel = items.map((item) => `${str(item.material_code)} ${num(item.received_quantity)}/${num(item.quantity)}`).join(" · ") || "Belum ada item";
        const remainingOptions = remainingItems.map((item) => ({ label: `${str(related(item.raw_materials).name, str(item.material_code))} · sisa ${num(item.quantity) - num(item.received_quantity)} ${str(related(item.raw_materials).unit)}`, value: str(item.id) }));
        return row(str(order.id), { "No. pesanan": str(order.id), Pemasok: str(order.supplier_name), Tanggal: date(order.order_date),
          "Nilai pesanan": rupiah(order.total), Penerimaan: receivedLabel, Status: str(order.status) }, { __id: str(order.id), __status: str(order.status), __remainingOptions: JSON.stringify(remainingOptions) });
      });
      const pending = orders.filter((order) => order.status === "Menunggu Persetujuan").length;
      const transit = orders.filter((order) => ["Dipesan", "Diterima Sebagian"].includes(str(order.status))).length;
      const total = orders.reduce((sum, order) => sum + num(order.total), 0);
      return { rows, options: {
        suppliers: records(suppliersResult.data).map((item) => ({ label: str(item.name), value: str(item.id) })),
        materials: records(materialsResult.data).map((item) => ({ label: `${str(item.name)} (${str(item.code)})`, value: str(item.code), unit: str(item.unit), cost: num(item.unit_cost) })),
      }, error: null, role, metrics: [{ label: "Menunggu persetujuan", value: String(pending), note: "status aktual" }, { label: "Dalam pengiriman", value: String(transit), note: "pesanan berjalan" }, { label: "Nilai pengadaan", value: rupiah(total), note: "seluruh pesanan terbaca" }] };
    }

    if (moduleKey === "inventory") {
      const [profileResult, stockResult, materialsResult, variantsResult] = await Promise.all([
        profilePromise,
        supabase.from("stock_balances").select("item_type,item_code,item_name,quantity,minimum_stock,unit_cost").order("item_name"),
        supabase.from("raw_materials").select("code,name,unit,unit_cost,minimum_stock").eq("active", true).order("name"),
        supabase.from("product_variants").select("sku,variant_name,unit_cost,minimum_stock,products(name)").eq("active", true).order("sku"),
      ]);
      const { data: profile, error: profileError } = profileResult;
      if (profileError) return failed(definition, profileError.message);
      if (!profile?.active || !profile.role) return failed(definition, "Profil aktif dengan hak akses belum tersedia.");
      const role = profile.role;
      const error = stockResult.error ?? materialsResult.error ?? variantsResult.error;
      if (error) return failed(definition, error.message, role);
      const stock = records(stockResult.data);
      const stockByKey = new Map(stock.map((item) => [`${str(item.item_type)}:${str(item.item_code)}`, item]));
      const catalogItems: DbRow[] = [
        ...records(materialsResult.data).map((item) => ({ item_type: "bahan_baku", item_code: item.code, item_name: item.name, unit: item.unit, unit_cost: item.unit_cost, minimum_stock: item.minimum_stock })),
        ...records(variantsResult.data).map((item) => ({ item_type: "produk_jadi", item_code: item.sku, item_name: `${str(related(item.products).name)} · ${str(item.variant_name)}`, unit: "unit", unit_cost: item.unit_cost, minimum_stock: item.minimum_stock })),
      ];
      const completeStock = catalogItems.map((catalogItem) => ({ ...catalogItem, ...(stockByKey.get(`${str(catalogItem.item_type)}:${str(catalogItem.item_code)}`) ?? {}) }));
      const rows = completeStock.map((item) => row(`${str(item.item_type)}:${str(item.item_code)}`, {
        "Item / Varian": str(item.item_name), Kode: str(item.item_code), Kategori: item.item_type === "produk_jadi" ? "Produk jadi" : "Bahan baku",
        "Stok tersedia": `${num(item.quantity)} ${str(item.unit, "unit")}`, "Batas minimum": `${num(item.minimum_stock)} ${str(item.unit, "unit")}`, Kondisi: num(item.quantity) <= num(item.minimum_stock) ? "Stok rendah" : "Aman",
      }, { __sku: str(item.item_code), __status: num(item.quantity) <= num(item.minimum_stock) ? "Stok rendah" : "Aman" }));
      const materials = records(materialsResult.data).map((item) => ({ label: `${str(item.name)} (${str(item.code)})`, value: `bahan_baku:${str(item.code)}`, kind: "bahan_baku", unit: str(item.unit), cost: num(item.unit_cost), minimum: num(item.minimum_stock) }));
      const variants = records(variantsResult.data).map((item) => ({ label: `${str(related(item.products).name)} · ${str(item.variant_name)} (${str(item.sku)})`, value: `produk_jadi:${str(item.sku)}`, kind: "produk_jadi", unit: "unit", cost: num(item.unit_cost), minimum: num(item.minimum_stock) }));
      const below = completeStock.filter((item) => num(item.quantity) <= num(item.minimum_stock)).length;
      return { rows, options: { inventoryItems: [...materials, ...variants] }, error: null, metrics: [
        { label: "Total SKU", value: String(completeStock.length), note: "bahan baku dan varian aktif" },
        { label: "Di bawah minimum", value: String(below), note: "perlu tindak lanjut" },
        { label: "Nilai persediaan", value: rupiah(completeStock.reduce((sum, item) => sum + num(item.quantity) * num(item.unit_cost), 0)), note: "berdasarkan saldo × HPP" },
      ], role };
    }

    if (moduleKey === "production") {
      const [profileResult, ordersResult, variantsResult] = await Promise.all([
        profilePromise,
        supabase.from("production_orders").select("id,sku,variant_name,planned_quantity,result_quantity,status,target_date,quality_checks(inspected_quantity,passed_quantity,rework_quantity,failed_quantity)").order("created_at", { ascending: false }),
        supabase.from("product_variants").select("sku,variant_name,products(name)").eq("active", true).order("sku"),
      ]);
      const { data: profile, error: profileError } = profileResult;
      if (profileError) return failed(definition, profileError.message);
      if (!profile?.active || !profile.role) return failed(definition, "Profil aktif dengan hak akses belum tersedia.");
      const role = profile.role;
      const error = ordersResult.error ?? variantsResult.error;
      if (error) return failed(definition, error.message, role);
      const orders = records(ordersResult.data);
      const rows = orders.map((order) => {
        const checks = records(order.quality_checks);
        const passed = checks.reduce((sum, item) => sum + num(item.passed_quantity), 0);
        const rework = checks.reduce((sum, item) => sum + num(item.rework_quantity), 0);
        return row(str(order.id), { "No. perintah": str(order.id), "Produk / Varian": `${str(order.sku)} · ${str(order.variant_name)}`, Rencana: `${num(order.planned_quantity)} unit`, "Hasil QC": checks.length ? `${passed} lolos · ${rework} perbaikan` : "Belum diperiksa", "Target selesai": date(order.target_date), Status: str(order.status) }, { __id: str(order.id), __sku: str(order.sku), __status: str(order.status) });
      });
      const active = orders.filter((item) => ["Direncanakan", "Diproses", "Menunggu QC"].includes(str(item.status))).length;
      const qc = orders.filter((item) => item.status === "Menunggu QC").length;
      const completed = orders.filter((item) => item.status === "Selesai QC" || item.status === "Selesai").length;
      return { rows, options: { variants: records(variantsResult.data).map((item) => ({ label: `${str(related(item.products).name)} · ${str(item.variant_name)} (${str(item.sku)})`, value: str(item.sku) })) }, error: null, role,
        metrics: [{ label: "Perintah aktif", value: String(active), note: "produksi belum selesai" }, { label: "Menunggu QC", value: String(qc), note: "perlu pemeriksaan" }, { label: "Selesai QC", value: String(completed), note: "dari data produksi" }] };
    }

    if (moduleKey === "sales") {
      const [profileResult, salesResult, customersResult, variantsResult] = await Promise.all([
        profilePromise,
        supabase.from("sales").select("id,customer_id,customer_name,total,status,payment_status,created_at,sale_items(quantity,sku)").order("created_at", { ascending: false }),
        supabase.from("customers").select("id,name").order("name"),
        supabase.from("product_variants").select("sku,variant_name,unit_price,products(name)").eq("active", true).order("sku"),
      ]);
      const { data: profile, error: profileError } = profileResult;
      if (profileError) return failed(definition, profileError.message);
      if (!profile?.active || !profile.role) return failed(definition, "Profil aktif dengan hak akses belum tersedia.");
      const role = profile.role;
      const error = salesResult.error ?? customersResult.error ?? variantsResult.error;
      if (error) return failed(definition, error.message, role);
      const sales = records(salesResult.data);
      const rows = sales.map((sale) => {
        return row(str(sale.id), { "No. transaksi": str(sale.id), Pelanggan: str(sale.customer_name), Tanggal: date(sale.created_at), Total: rupiah(sale.total), Pembayaran: str(sale.payment_status), "Status pesanan": str(sale.status) }, { __id: str(sale.id), __status: str(sale.status) });
      });
      const total = sales.reduce((sum, sale) => sum + num(sale.total), 0);
      const outstanding = sales.filter((sale) => sale.payment_status !== "Lunas").length;
      const active = sales.filter((sale) => !["Selesai", "Dibatalkan", "Terpenuhi"].includes(str(sale.status))).length;
      return { rows, options: {
        customers: records(customersResult.data).map((item) => ({ label: str(item.name), value: str(item.id) })),
        variants: records(variantsResult.data).map((item) => ({ label: `${str(related(item.products).name)} · ${str(item.variant_name)} · ${rupiah(item.unit_price)}`, value: str(item.sku), cost: num(item.unit_price) })),
      }, error: null, role, metrics: [{ label: "Total transaksi", value: String(sales.length), note: "data Supabase" }, { label: "Penjualan tercatat", value: rupiah(total), note: "seluruh transaksi" }, { label: "Pesanan berjalan", value: String(active), note: `${outstanding} belum lunas` }] };
    }

    if (moduleKey === "finance") {
      const [profileResult, expensesResult, transactionsResult] = await Promise.all([
        profilePromise,
        supabase.from("operating_expenses").select("id,expense_type,amount,description,transaction_date").order("transaction_date", { ascending: false }),
        supabase.from("financial_transactions").select("id,direction,amount,source_type,source_id,status,transaction_date").order("transaction_date", { ascending: false }),
      ]);
      const { data: profile, error: profileError } = profileResult;
      if (profileError) return failed(definition, profileError.message);
      if (!profile?.active || !profile.role) return failed(definition, "Profil aktif dengan hak akses belum tersedia.");
      const role = profile.role;
      const error = expensesResult.error ?? transactionsResult.error;
      if (error) return failed(definition, error.message, role);
      const transactions = records(transactionsResult.data);
      const expenseById = new Map(records(expensesResult.data).map((item) => [str(item.id), item]));
      const financeRows = transactions.map((item) => {
        const source = expenseById.get(str(item.source_id));
        return row(str(item.id), { Referensi: str(item.id), "Jenis transaksi": `${str(item.direction)} · ${str(item.source_type)}`, "Pihak terkait": source ? `${str(source.expense_type)} · ${str(source.description, "Tanpa keterangan")}` : str(item.source_id), Tanggal: date(item.transaction_date), Nilai: rupiah(item.amount), Status: str(item.status) }, { __id: str(item.id), __status: str(item.status) });
      });
      const income = transactions.filter((item) => item.direction === "MASUK" && item.status === "Terverifikasi").reduce((sum, item) => sum + num(item.amount), 0);
      const expense = transactions.filter((item) => item.direction === "KELUAR" && item.status === "Terverifikasi").reduce((sum, item) => sum + num(item.amount), 0);
      const pending = transactions.filter((item) => item.status === "Menunggu Verifikasi").length;
      return { rows: financeRows, options: {}, error: null, role, metrics: [
        { label: "Kas masuk", value: rupiah(income), note: "transaksi Supabase" },
        { label: "Kas keluar", value: rupiah(expense), note: "transaksi Supabase" },
        { label: "Menunggu verifikasi", value: String(pending), note: "perlu diproses" },
      ] };
    }

    if (moduleKey === "reports") {
      const [profileResult, salesResult, stockResult, productionResult, financeResult] = await Promise.all([
        profilePromise,
        supabase.from("sales").select("total,status,payment_status,created_at"),
        supabase.from("stock_balances").select("item_type,item_code,item_name,quantity,minimum_stock,unit_cost"),
        supabase.from("production_orders").select("id,status,planned_quantity,result_quantity,target_date"),
        supabase.from("financial_transactions").select("direction,amount,status"),
      ]);
      const { data: profile, error: profileError } = profileResult;
      if (profileError) return failed(definition, profileError.message);
      if (!profile?.active || !profile.role) return failed(definition, "Profil aktif dengan hak akses belum tersedia.");
      const role = profile.role;
      const error = salesResult.error ?? stockResult.error ?? productionResult.error ?? financeResult.error;
      if (error) return failed(definition, error.message, role);
      const sales = records(salesResult.data); const stock = records(stockResult.data); const production = records(productionResult.data); const finance = records(financeResult.data);
      const revenue = sales.filter((item) => item.status !== "Dibatalkan").reduce((sum, item) => sum + num(item.total), 0);
      const inventoryValue = stock.reduce((sum, item) => sum + num(item.quantity) * num(item.unit_cost), 0);
      const planned = production.reduce((sum, item) => sum + num(item.planned_quantity), 0);
      const produced = production.reduce((sum, item) => sum + num(item.result_quantity), 0);
      const verifiedIncome = finance.filter((item) => item.direction === "MASUK" && item.status === "Terverifikasi").reduce((sum, item) => sum + num(item.amount), 0);
      const verifiedExpense = finance.filter((item) => item.direction === "KELUAR" && item.status === "Terverifikasi").reduce((sum, item) => sum + num(item.amount), 0);
      const rows = [
        row("sales", { Laporan: "Ringkasan penjualan", Periode: "Seluruh data", Diperbarui: date(new Date()), "Pemilik data": "Penjualan", Nilai: rupiah(revenue), Status: `${sales.length} transaksi` }),
        row("inventory", { Laporan: "Posisi persediaan", Periode: "Saldo saat ini", Diperbarui: date(new Date()), "Pemilik data": "Gudang", Nilai: rupiah(inventoryValue), Status: `${stock.length} item` }),
        row("production", { Laporan: "Realisasi produksi", Periode: "Seluruh data", Diperbarui: date(new Date()), "Pemilik data": "Produksi", Nilai: `${produced} / ${planned} unit`, Status: `${production.length} perintah` }),
        row("finance", { Laporan: "Arus kas terverifikasi", Periode: "Seluruh data", Diperbarui: date(new Date()), "Pemilik data": "Keuangan", Nilai: rupiah(verifiedIncome - verifiedExpense), Status: "Terverifikasi" }),
      ];
      return { rows, options: {}, error: null, role, metrics: [
        { label: "Penjualan tercatat", value: rupiah(revenue), note: `${sales.length} transaksi` },
        { label: "Realisasi produksi", value: pct(planned ? produced / planned * 100 : 0), note: `${produced} dari ${planned} unit` },
        { label: "Arus kas bersih", value: rupiah(verifiedIncome - verifiedExpense), note: "transaksi terverifikasi" },
      ] };
    }

    if (moduleKey === "users") {
      const [profileResult, usersResult] = await Promise.all([
        profilePromise,
        supabase.from("profiles").select("id,email,full_name,role,active,created_at").order("full_name"),
      ]);
      const { data: profile, error: profileError } = profileResult;
      if (profileError) return failed(definition, profileError.message);
      if (!profile?.active || !profile.role) return failed(definition, "Profil aktif dengan hak akses belum tersedia.");
      const role = profile.role;
      const { data, error } = usersResult;
      if (error) return failed(definition, error.message, role);
      const profiles = records(data);
      return { rows: profiles.map((item) => row(str(item.id), { "Nama pengguna": str(item.full_name), Email: str(item.email), Peran: str(item.role), "Aktivitas terakhir": date(item.created_at), Status: item.active ? "Aktif" : "Nonaktif" }, { __userId: str(item.id), __status: item.active ? "Aktif" : "Nonaktif" })), options: {}, error: null, role,
        metrics: [{ label: "Pengguna terdaftar", value: String(profiles.length), note: "profil aktif dan nonaktif" }, { label: "Peran tersedia", value: "7", note: "sesuai skema akses" }, { label: "Akun nonaktif", value: String(profiles.filter((item) => !item.active).length), note: "tidak dapat memakai aplikasi" }] };
    }

    if (moduleKey === "activity") {
      const [profileResult, activityResult] = await Promise.all([
        profilePromise,
        supabase.from("audit_logs").select("id,module,action,document_id,created_at,profiles(full_name)").order("created_at", { ascending: false }).limit(500),
      ]);
      const { data: profile, error: profileError } = profileResult;
      if (profileError) return failed(definition, profileError.message);
      if (!profile?.active || !profile.role) return failed(definition, "Profil aktif dengan hak akses belum tersedia.");
      const role = profile.role;
      const { data, error } = activityResult;
      if (error) return failed(definition, error.message, role);
      const logs = records(data);
      return { rows: logs.map((item) => row(str(item.id), { Pengguna: str(related(item.profiles).full_name), Aktivitas: str(item.action), Modul: str(item.module), Dokumen: str(item.document_id), Waktu: date(item.created_at) })), options: {}, error: null, role,
        metrics: [{ label: "Aktivitas tercatat", value: String(logs.length), note: "maksimal 500 terbaru" }, { label: "Modul", value: String(new Set(logs.map((item) => str(item.module))).size), note: "berdasarkan log" }, { label: "Pembaruan terakhir", value: logs.length ? date(logs[0].created_at) : "—", note: "waktu Supabase" }] };
    }
    return failed(definition, "Modul belum memiliki pemetaan data Supabase.");
  } catch (error) {
    return failed(definition, error instanceof Error ? error.message : "Tidak dapat memuat data Supabase.");
  }
}
