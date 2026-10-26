import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return <AppShell demoMode>{children}</AppShell>;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role, active").eq("id", user.id).maybeSingle();
  if (!profile?.active || !profile.role) redirect("/login?error=profile");
  return (
    <AppShell
      demoMode={false}
      user={{
        name: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Pengguna",
        role: profile?.role || "Pemilik",
        email: user.email || "",
      }}
    >
      {children}
    </AppShell>
  );
}
