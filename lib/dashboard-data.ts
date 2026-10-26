import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardMetric = { label: string; value: string; change: string; direction: "up" | "down"; note: string };
export type DashboardSale = { id: string; customer: string; product: string; date: string; amount: string; status: "Selesai" | "Diproses" | "Menunggu pembayaran"; initials: string; tone: string };
export type DashboardCategory = { label: string; amount: string; value: number; color: string; hint: string };
export type DashboardSnapshot = {
  source: "supabase";
  metrics: DashboardMetric[];
  recentSales: DashboardSale[];
  sales: number[];
  monthLabels: string[];
  categories: DashboardCategory[];
  alerts: { name: string; code: string; stock: string; threshold: string; severity: "urgent" | "watch" }[];
  pendingQc: number;
  pendingApprovals: number;
  greetingName: string;
  error: string | null;
  readAccess: { sales: boolean; stock: boolean; production: boolean; purchases: boolean };
};

const money = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
const idDate = (value: string | Date) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Makassar" }).format(new Date(value));
const roleCanReadSales = (role: string) => ["Pemilik", "Gudang", "Penjualan", "Keuangan"].includes(role);
const roleCanReadStock = (role: string) => ["Pemilik", "Pengadaan", "Gudang", "Produksi", "Penjualan", "Keuangan"].includes(role);
const roleCanReadProduction = (role: string) => ["Pemilik", "Produksi", "Gudang", "Keuangan"].includes(role);
const roleCanReadPurchases = (role: string) => ["Pemilik", "Pengadaan", "Gudang", "Keuangan"].includes(role);

function emptySnapshot(error: string | null, greetingName = "") : DashboardSnapshot {
  return {
    source: "supabase",
    metrics: [
      { label: "Total penjualan", value: "—", change: "Supabase", direction: "up", note: "belum ada data yang dapat dibaca" },
      { label: "Nilai persediaan", value: "—", change: "Supabase", direction: "up", note: "belum ada data yang dapat dibaca" },
      { label: "Produksi berjalan", value: "—", change: "Supabase", direction: "up", note: "belum ada data yang dapat dibaca" },
      { label: "Laba kotor", value: "—", change: "Supabase", direction: "up", note: "belum ada data yang dapat dibaca" },
    ],
    recentSales: [], sales: Array.from({ length: 12 }, () => 0), monthLabels: [], categories: [], alerts: [], pendingQc: 0, pendingApprovals: 0, greetingName, error,
    readAccess: { sales: false, stock: false, production: false, purchases: false },
  };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return emptySnapshot("Konfigurasi Supabase belum tersedia di server.");

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return emptySnapshot("Sesi login Supabase tidak ditemukan.");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("full_name,role,active").eq("id", user.id).maybeSingle();
  if (profileError || !profile?.active || !profile.role) return emptySnapshot(profileError?.message ?? "Profil aktif tidak ditemukan.");
  const greetingName = profile.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Pengguna";

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const chartStart = new Date(Date.UTC(currentYear, currentMonth - 11, 1));
  const currentStart = new Date(Date.UTC(currentYear, currentMonth, 1));
  const priorStart = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
  const readAccess = {
    sales: roleCanReadSales(profile.role), stock: roleCanReadStock(profile.role),
    production: roleCanReadProduction(profile.role), purchases: roleCanReadPurchases(profile.role),
  };
  const [{ data: sales, error: salesError }, { data: stock, error: stockError }, { data: production, error: productionError }, { data: approvals, error: approvalsError }] = await Promise.all([
    roleCanReadSales(profile.role) ? supabase.from("sales").select("id,customer_name,total,status,payment_status,created_at").gte("created_at", chartStart.toISOString()).neq("status", "Dibatalkan").order("created_at", { ascending: false }).limit(3000) : Promise.resolve({ data: [], error: null }),
    roleCanReadStock(profile.role) ? supabase.from("stock_balances").select("item_type,item_code,item_name,quantity,minimum_stock,unit_cost") : Promise.resolve({ data: [], error: null }),
    roleCanReadProduction(profile.role) ? supabase.from("production_orders").select("id,status,result_quantity,planned_quantity").in("status", ["Direncanakan", "Diproses", "Menunggu QC", "Selesai QC"]) : Promise.resolve({ data: [], error: null }),
    roleCanReadPurchases(profile.role) ? supabase.from("purchase_orders").select("id").eq("status", "Menunggu Persetujuan") : Promise.resolve({ data: [], error: null }),
  ]);
  const queryError = salesError ?? stockError ?? productionError ?? approvalsError;
  if (queryError) return emptySnapshot(queryError.message, greetingName);

  const salesRows = sales ?? [];
  const stockRows = stock ?? [];
  const monthAmounts = Array.from({ length: 12 }, () => 0);
  const monthLabels = Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(currentYear, currentMonth - 11 + index, 15))));
  for (const sale of salesRows) {
    const date = new Date(sale.created_at);
    const offset = (currentYear - date.getUTCFullYear()) * 12 + currentMonth - date.getUTCMonth();
    if (offset >= 0 && offset < 12) monthAmounts[11 - offset] += Number(sale.total ?? 0);
  }
  const currentSales = salesRows.filter((sale) => new Date(sale.created_at) >= currentStart);
  const previousSalesTotal = salesRows.filter((sale) => new Date(sale.created_at) >= priorStart && new Date(sale.created_at) < currentStart).reduce((sum, sale) => sum + Number(sale.total ?? 0), 0);
  const currentSalesTotal = currentSales.reduce((sum, sale) => sum + Number(sale.total ?? 0), 0);
  const salesChange = previousSalesTotal > 0 ? `${currentSalesTotal >= previousSalesTotal ? "+" : ""}${(((currentSalesTotal - previousSalesTotal) / previousSalesTotal) * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%` : currentSalesTotal > 0 ? "Baru" : "0%";
  const inventoryValue = stockRows.reduce((sum, item) => sum + Number(item.quantity ?? 0) * Number(item.unit_cost ?? 0), 0);
  const activeProduction = production?.filter((item) => ["Direncanakan", "Diproses", "Menunggu QC"].includes(item.status)).length ?? 0;
  const pendingQc = production?.filter((item) => item.status === "Menunggu QC").length ?? 0;
  const alerts = stockRows.filter((item) => Number(item.quantity ?? 0) <= Number(item.minimum_stock ?? 0)).slice(0, 5).map((item) => ({
    name: item.item_name ?? item.item_code, code: item.item_code, stock: `${Number(item.quantity ?? 0)} unit`, threshold: `${Number(item.minimum_stock ?? 0)} unit`, severity: "urgent" as const,
  }));

  let grossProfit = 0;
  const categorySales = new Map<string, { amount: number; quantity: number }>();
  if (salesRows.length && roleCanReadSales(profile.role)) {
    const { data: saleItems, error: itemError } = await supabase.from("sale_items").select("sale_id,sku,quantity,unit_price,discount").in("sale_id", salesRows.map((sale) => sale.id));
    if (itemError) return emptySnapshot(itemError.message, greetingName);
    const items = saleItems ?? [];
    const skus = Array.from(new Set(items.map((item) => item.sku)));
    const { data: variants, error: variantError } = skus.length ? await supabase.from("product_variants").select("sku,unit_cost,products(product_categories(name))").in("sku", skus) : { data: [], error: null };
    if (variantError) return emptySnapshot(variantError.message, greetingName);
    const variantMap = new Map((variants ?? []).map((variant) => [variant.sku, variant]));
    const saleMap = new Map(salesRows.map((sale) => [sale.id, sale]));
    for (const item of items) {
      const variant = variantMap.get(item.sku);
      const qty = Number(item.quantity ?? 0);
      const lineRevenue = Number(item.unit_price ?? 0) * qty - Number(item.discount ?? 0);
      grossProfit += lineRevenue - Number(variant?.unit_cost ?? 0) * qty;
      const sale = saleMap.get(item.sale_id);
      if (!sale || sale.status === "Dibatalkan") continue;
      const product = variant?.products as unknown as { product_categories?: { name?: string } | { name?: string }[] } | null;
      const categoryRelation = Array.isArray(product?.product_categories) ? product.product_categories[0] : product?.product_categories;
      const name = categoryRelation?.name ?? "Tanpa kategori";
      const previous = categorySales.get(name) ?? { amount: 0, quantity: 0 };
      previous.amount += lineRevenue; previous.quantity += qty; categorySales.set(name, previous);
    }
  }
  const categoryColors = ["#b82e45", "#d45a6c", "#e9a0aa", "#8f1e35", "#f2c0c7"];
  const maxCategory = Math.max(...Array.from(categorySales.values()).map((item) => item.amount), 1);
  const categories = Array.from(categorySales, ([label, item], index) => ({ label, amount: money(item.amount), value: Math.round(item.amount / maxCategory * 100), color: categoryColors[index % categoryColors.length], hint: `${item.quantity.toLocaleString("id-ID")} unit terjual` })).sort((a, b) => Number(b.amount.replace(/[^0-9]/g, "")) - Number(a.amount.replace(/[^0-9]/g, "")));
  const tones = ["lavender", "peach", "mint", "blue", "rose"];
  const recentSales = currentSales.slice(0, 8).map((sale, index) => {
    const customer = sale.customer_name || "Pelanggan";
    const status: DashboardSale["status"] = sale.payment_status !== "Lunas" ? "Menunggu pembayaran" : ["Terpenuhi", "Selesai"].includes(sale.status) ? "Selesai" : "Diproses";
    return { id: sale.id, customer, product: "Transaksi penjualan", date: idDate(sale.created_at), amount: money(Number(sale.total ?? 0)), status, initials: customer.split(" ").map((part: string) => part[0]).slice(0, 2).join("").toUpperCase(), tone: tones[index % tones.length] };
  });

  return {
    source: "supabase",
    metrics: [
      { label: "Total penjualan", value: readAccess.sales ? money(currentSalesTotal) : "—", change: readAccess.sales ? salesChange : "Akses terbatas", direction: currentSalesTotal >= previousSalesTotal ? "up" : "down", note: readAccess.sales ? "dibanding bulan sebelumnya" : "peran ini tidak membaca data penjualan" },
      { label: "Nilai persediaan", value: readAccess.stock ? money(inventoryValue) : "—", change: readAccess.stock ? "Aktual" : "Akses terbatas", direction: "up", note: readAccess.stock ? "saldo × HPP dari Supabase" : "peran ini tidak membaca data stok" },
      { label: "Produksi berjalan", value: readAccess.production ? String(activeProduction) : "—", change: readAccess.production ? `${pendingQc} menunggu QC` : "Akses terbatas", direction: "up", note: readAccess.production ? "perintah produksi aktif" : "peran ini tidak membaca data produksi" },
      { label: "Laba kotor", value: readAccess.sales ? money(grossProfit) : "—", change: readAccess.sales ? "Aktual" : "Akses terbatas", direction: grossProfit >= 0 ? "up" : "down", note: readAccess.sales ? "penjualan dikurangi HPP" : "peran ini tidak membaca data penjualan" },
    ],
    recentSales, sales: monthAmounts, monthLabels, categories, alerts, pendingQc, pendingApprovals: approvals?.length ?? 0, greetingName, error: null, readAccess,
  };
}
