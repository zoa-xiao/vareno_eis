import { HelpCenter } from "@/components/help-center";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HelpPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <HelpCenter tickets={[]} ticketError="Konfigurasi Supabase belum tersedia." />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <HelpCenter tickets={[]} ticketError="Silakan masuk kembali untuk membuka tiket bantuan." />;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const { data, error } = await supabase.from("support_tickets").select("id,subject,category,status,created_at").order("created_at", { ascending: false }).limit(50);
  const tickets = (data ?? []).map((ticket) => ({ id: ticket.id, subject: ticket.subject, category: ticket.category, status: ticket.status, createdAt: ticket.created_at }));
  return <HelpCenter tickets={tickets} ticketError={error?.message ?? null} role={profile?.role ?? ""} />;
}
