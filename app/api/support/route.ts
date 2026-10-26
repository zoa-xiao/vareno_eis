import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Konfigurasi Supabase belum tersedia." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Silakan login kembali." }, { status: 401 });
  const { data: profile, error: profileError } = await supabase.from("profiles").select("active").eq("id", user.id).maybeSingle();
  if (profileError || !profile?.active) return NextResponse.json({ error: "Profil pengguna aktif diperlukan." }, { status: 403 });

  let body: { subject?: string; category?: string; message?: string };
  try { body = await request.json() as typeof body; } catch { return NextResponse.json({ error: "Isi permintaan tidak valid." }, { status: 400 }); }
  const { data, error } = await supabase.rpc("create_support_ticket", {
    p_subject: String(body.subject ?? "").trim(), p_category: String(body.category ?? ""), p_message: String(body.message ?? "").trim(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data });
}
