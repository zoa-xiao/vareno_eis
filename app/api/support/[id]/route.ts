import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Konfigurasi Supabase belum tersedia." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Silakan login kembali." }, { status: 401 });
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role,active").eq("id", user.id).maybeSingle();
  if (profileError || !profile?.active || !["Pemilik", "Admin"].includes(profile.role)) return NextResponse.json({ error: "Hanya Pemilik atau Admin aktif yang dapat memperbarui tiket." }, { status: 403 });
  let body: { status?: string };
  try { body = await request.json() as typeof body; } catch { return NextResponse.json({ error: "Isi permintaan tidak valid." }, { status: 400 }); }
  const { id } = await context.params;
  const { error } = await supabase.rpc("update_support_ticket", { p_ticket_id: id, p_status: String(body.status ?? "") });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
