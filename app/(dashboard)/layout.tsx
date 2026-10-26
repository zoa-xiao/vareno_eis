import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { getCurrentUserContext } from "@/lib/supabase/user-context";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { supabase, claims, profile } = await getCurrentUserContext();
  if (!supabase) redirect("/login?setup=supabase");
  if (!claims) redirect("/login");
  if (!profile?.active || !profile.role) redirect("/login?error=profile");

  const metadata = claims.user_metadata;
  const email = typeof claims.email === "string" ? claims.email : "";
  return (
    <AppShell user={{
      name: profile.full_name || (typeof metadata?.full_name === "string" ? metadata.full_name : "") || email.split("@")[0] || "Pengguna",
      role: profile.role,
      email,
    }}>
      {children}
    </AppShell>
  );
}
