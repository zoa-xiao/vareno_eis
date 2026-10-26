import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const allowedRoles = ["Admin", "Pengadaan", "Gudang", "Produksi", "Penjualan", "Keuangan"];

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Konfigurasi Supabase server belum tersedia." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Silakan login kembali." }, { status: 401 });
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role,active").eq("id", user.id).maybeSingle();
  if (profileError || !profile?.active || !["Pemilik", "Admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Hanya Pemilik atau Admin aktif yang dapat mengundang pengguna." }, { status: 403 });
  }

  let body: { email?: string; fullName?: string; role?: string };
  try { body = await request.json() as typeof body; } catch { return NextResponse.json({ error: "Isi permintaan tidak valid." }, { status: 400 }); }
  const email = String(body.email ?? "").trim().toLowerCase();
  const fullName = String(body.fullName ?? "").trim();
  const role = String(body.role ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Nama, email valid, dan peran staf wajib diisi." }, { status: 400 });
  }
  if (profile.role === "Admin" && role === "Pemilik") return NextResponse.json({ error: "Admin tidak dapat membuat akun Pemilik." }, { status: 403 });

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return NextResponse.json({ error: "Undangan pengguna memerlukan SUPABASE_SERVICE_ROLE_KEY di environment server. Atur di .env.local tanpa awalan NEXT_PUBLIC_, lalu restart aplikasi." }, { status: 503 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return NextResponse.json({ error: "NEXT_PUBLIC_SUPABASE_URL belum tersedia." }, { status: 503 });

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName } });
  if (error || !data.user) return NextResponse.json({ error: error?.message ?? "Supabase tidak mengembalikan pengguna undangan." }, { status: 400 });
  const { error: insertError } = await admin.from("profiles").upsert({ id: data.user.id, email, full_name: fullName, role, active: true });
  if (insertError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: `Akun undangan dibatalkan karena profil gagal dibuat: ${insertError.message}` }, { status: 400 });
  }
  await admin.from("audit_logs").insert({ user_id: user.id, module: "Pengguna", action: "Mengundang pengguna baru", document_id: data.user.id, new_value: { email, role } });
  return NextResponse.json({ ok: true, id: data.user.id });
}
