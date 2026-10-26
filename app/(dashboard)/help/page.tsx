import { HelpCenter } from "@/components/help-center";
import { getCurrentAuthContext } from "@/lib/supabase/user-context";

export default async function HelpPage() {
  const { supabase, claims, profilePromise, error: contextError } = await getCurrentAuthContext();
  if (!supabase) return <HelpCenter tickets={[]} ticketError={contextError ?? "Konfigurasi Supabase belum tersedia."} />;
  if (!claims) return <HelpCenter tickets={[]} ticketError={contextError ?? "Silakan masuk kembali untuk membuka tiket bantuan."} />;
  if (!profilePromise) return <HelpCenter tickets={[]} ticketError={contextError ?? "Profil aktif tidak ditemukan."} />;
  const [profileResult, ticketsResult] = await Promise.all([
    profilePromise,
    supabase.from("support_tickets").select("id,subject,category,status,created_at").order("created_at", { ascending: false }).limit(50),
  ]);
  const { data: profile, error: profileError } = profileResult;
  if (profileError || !profile?.active) return <HelpCenter tickets={[]} ticketError={profileError?.message ?? "Profil aktif tidak ditemukan."} />;
  const { data, error } = ticketsResult;
  const tickets = (data ?? []).map((ticket) => ({ id: ticket.id, subject: ticket.subject, category: ticket.category, status: ticket.status, createdAt: ticket.created_at }));
  return <HelpCenter tickets={tickets} ticketError={error?.message ?? null} role={profile?.role ?? ""} />;
}
