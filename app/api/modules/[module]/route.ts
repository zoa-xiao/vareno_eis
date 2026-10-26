import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Payload = Record<string, unknown>;
const text = (body: Payload, key: string) => String(body[key] ?? "").trim();
const number = (body: Payload, key: string) => Number(body[key]);
const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export async function POST(request: NextRequest, context: { params: Promise<{ module: string }> }) {
  const { module } = await context.params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fail("Konfigurasi Supabase server belum tersedia.", 503);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return fail("Sesi login berakhir. Silakan masuk kembali.", 401);
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role,active").eq("id", user.id).maybeSingle();
  if (profileError) return fail(profileError.message, 403);
  if (!profile?.active || !profile.role) return fail("Profil aktif dengan peran yang valid diperlukan.", 403);

  let body: Payload;
  try { body = await request.json() as Payload; } catch { return fail("Isi permintaan tidak valid."); }
  const action = text(body, "action");
  const role = profile.role;
  const can = (...roles: string[]) => role === "Admin" || roles.includes(role);

  try {
    if (module === "products" && action === "add-bom-item") {
      if (!can("Produksi", "Pemilik")) return fail("Peran Produksi atau Pemilik diperlukan.", 403);
      const { data, error } = await supabase.rpc("add_bom_material", { p_product_id: text(body, "productId"), p_material_code: text(body, "materialCode"), p_quantity_per_unit: number(body, "quantityPerUnit") });
      if (error) return fail(error.message);
      return NextResponse.json({ ok: true, id: data });
    }
    if (module === "purchases" && action === "create-supplier") {
      if (!can("Pengadaan", "Pemilik")) return fail("Peran Pengadaan atau Pemilik diperlukan.", 403);
      const { data, error } = await supabase.rpc("create_supplier", { p_name: text(body, "name"), p_contact: text(body, "contact"), p_address: text(body, "address") });
      if (error) return fail(error.message);
      return NextResponse.json({ ok: true, id: data });
    }
    if (module === "purchases" && action === "create-material") {
      if (!can("Pengadaan", "Pemilik")) return fail("Peran Pengadaan atau Pemilik diperlukan.", 403);
      const { data, error } = await supabase.rpc("create_raw_material", {
        p_code: text(body, "code"), p_name: text(body, "name"), p_material_type: text(body, "materialType"), p_unit: text(body, "unit"),
        p_unit_cost: number(body, "unitCost"), p_minimum_stock: number(body, "minimumStock"),
      });
      if (error) return fail(error.message);
      return NextResponse.json({ ok: true, id: data });
    }
    if (module === "sales" && action === "create-customer") {
      if (!can("Penjualan", "Pemilik")) return fail("Peran Penjualan atau Pemilik diperlukan.", 403);
      const { data, error } = await supabase.rpc("create_customer", { p_name: text(body, "name"), p_contact: text(body, "contact"), p_address: text(body, "address") });
      if (error) return fail(error.message);
      return NextResponse.json({ ok: true, id: data });
    }
    if (module === "products") {
      if (action === "create") {
        if (!can("Produksi", "Pemilik")) return fail("Peran Produksi atau Pemilik diperlukan.", 403);
        const { data, error } = await supabase.rpc("create_product_variant", {
          p_name: text(body, "name"), p_model: text(body, "model"), p_category: text(body, "category"), p_sku: text(body, "sku"),
          p_variant_name: text(body, "variantName"), p_size: text(body, "size"), p_color: text(body, "color"),
          p_unit_price: number(body, "unitPrice"), p_unit_cost: number(body, "unitCost"), p_minimum_stock: number(body, "minimumStock"),
        });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true, id: data });
      }
      if (action === "update-price") {
        if (!can("Produksi", "Pemilik")) return fail("Peran Produksi atau Pemilik diperlukan.", 403);
        const price = number(body, "unitPrice");
        if (!text(body, "sku") || !Number.isFinite(price) || price < 0) return fail("SKU dan harga jual yang valid wajib diisi.");
        const { error } = await supabase.rpc("update_product_price", { p_sku: text(body, "sku"), p_unit_price: price });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true });
      }
    }

    if (module === "purchases") {
      if (action === "create") {
        if (!can("Pengadaan")) return fail("Hanya peran Pengadaan yang dapat membuat pesanan pembelian.", 403);
        const { data, error } = await supabase.rpc("create_purchase_order", {
          p_supplier_id: text(body, "supplierId"), p_material_code: text(body, "materialCode"),
          p_quantity: number(body, "quantity"), p_unit_price: number(body, "unitPrice"), p_order_date: text(body, "date"),
        });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true, id: data });
      }
      if (action === "approve") {
        if (!can("Pemilik")) return fail("Hanya Pemilik yang dapat menyetujui pesanan pembelian.", 403);
        const { data, error } = await supabase.rpc("approve_purchase_order", { order_number: text(body, "id") });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true, data });
      }
      if (action === "receive") {
        if (!can("Gudang", "Pemilik")) return fail("Peran Gudang atau Pemilik diperlukan untuk menerima barang.", 403);
        const { error } = await supabase.rpc("receive_purchase_order", { p_order_id: text(body, "id"), p_item_id: text(body, "itemId"), p_quantity: number(body, "quantity") });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true });
      }
    }

    if (module === "inventory" && action === "movement") {
      if (!can("Gudang", "Pemilik")) return fail("Peran Gudang atau Pemilik diperlukan.", 403);
      const [itemType, itemCode] = text(body, "item").split(":");
      const quantity = number(body, "quantity");
      if (!itemCode || !["bahan_baku", "produk_jadi"].includes(itemType) || !Number.isFinite(quantity) || quantity <= 0) return fail("Item dan jumlah mutasi yang valid wajib diisi.");
      const { error } = await supabase.rpc("record_stock_adjustment", {
        p_item_type: itemType, p_item_code: itemCode, p_movement_type: text(body, "movementType"), p_quantity: quantity, p_reason: text(body, "reason"),
      });
      if (error) return fail(error.message);
      return NextResponse.json({ ok: true });
    }

    if (module === "production") {
      if (action === "create") {
        if (!can("Produksi", "Pemilik")) return fail("Peran Produksi atau Pemilik diperlukan.", 403);
        const { data, error } = await supabase.rpc("create_production_order", { p_sku: text(body, "sku"), p_planned_quantity: number(body, "quantity"), p_target_date: text(body, "date") });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true, id: data });
      }
      if (action === "status") {
        if (!can("Produksi", "Pemilik")) return fail("Peran Produksi atau Pemilik diperlukan.", 403);
        const { error } = await supabase.rpc("update_production_status", { p_order_id: text(body, "id"), p_status: text(body, "status") });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true });
      }
      if (action === "quality-check") {
        if (!can("Produksi", "Pemilik")) return fail("Peran Produksi atau Pemilik diperlukan.", 403);
        const { error } = await supabase.rpc("record_quality_check", {
          p_order_id: text(body, "id"), p_inspected: number(body, "inspected"), p_passed: number(body, "passed"),
          p_rework: number(body, "rework"), p_failed: number(body, "failed"),
        });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true });
      }
    }

    if (module === "sales") {
      if (action === "create") {
        if (!can("Penjualan", "Pemilik")) return fail("Peran Penjualan atau Pemilik diperlukan.", 403);
        const { data, error } = await supabase.rpc("create_sale", {
          p_customer_id: text(body, "customerId"), p_sku: text(body, "sku"), p_quantity: number(body, "quantity"), p_discount: number(body, "discount"),
        });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true, id: data });
      }
      if (action === "fulfill") {
        if (!can("Gudang", "Penjualan", "Pemilik")) return fail("Peran Gudang, Penjualan, atau Pemilik diperlukan.", 403);
        const { error } = await supabase.rpc("fulfill_sale", { p_sale_id: text(body, "id") });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true });
      }
      if (action === "payment") {
        if (!can("Penjualan", "Keuangan", "Pemilik")) return fail("Peran Penjualan, Keuangan, atau Pemilik diperlukan.", 403);
        const { data, error } = await supabase.rpc("record_sale_payment", { p_sale_id: text(body, "id"), p_amount: number(body, "amount") });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true, id: data });
      }
    }

    if (module === "finance") {
      if (action === "create-expense") {
        if (!can("Keuangan", "Pemilik")) return fail("Peran Keuangan atau Pemilik diperlukan.", 403);
        const { data, error } = await supabase.rpc("create_expense", {
          p_expense_type: text(body, "type"), p_amount: number(body, "amount"), p_description: text(body, "description"), p_date: text(body, "date"),
        });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true, id: data });
      }
      if (action === "verify") {
        if (!can("Keuangan", "Pemilik")) return fail("Peran Keuangan atau Pemilik diperlukan.", 403);
        const { error } = await supabase.rpc("verify_financial_transaction", { p_transaction_id: text(body, "id"), p_decision: text(body, "decision") });
        if (error) return fail(error.message);
        return NextResponse.json({ ok: true });
      }
    }

    if (module === "users" && action === "update-profile") {
      if (!can("Pemilik", "Admin")) return fail("Peran Pemilik atau Admin diperlukan.", 403);
      const targetId = text(body, "id");
      if (!targetId) return fail("Profil pengguna tidak ditemukan.");
      if (role === "Admin" && targetId === user.id) return fail("Admin tidak dapat mengubah peran atau status akun sendiri.", 403);
      if (role === "Admin" && text(body, "role") === "Pemilik") return fail("Admin tidak dapat mengangkat pengguna menjadi Pemilik.", 403);
      const { error } = await supabase.rpc("update_user_profile", {
        p_target_id: targetId, p_full_name: text(body, "fullName"), p_role: text(body, "role"), p_active: typeof body.active === "boolean" ? body.active : null,
      });
      if (error) return fail(error.message);
      return NextResponse.json({ ok: true });
    }

    return fail("Aksi ini belum tersedia untuk modul tersebut.", 422);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Permintaan gagal diproses.", 500);
  }
}
