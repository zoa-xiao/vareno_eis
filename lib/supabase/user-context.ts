import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Resolve the verified session once and start the profile read immediately. */
export const getCurrentAuthContext = cache(async () => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { supabase: null, claims: null, profilePromise: null, error: "Konfigurasi Supabase belum tersedia di server." };

  const { data: claimsData, error: authError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims ?? null;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  if (authError || !userId) {
    return { supabase, claims: null, profilePromise: null, error: authError?.message ?? "Sesi login Supabase tidak ditemukan." };
  }

  const profilePromise = (async () => {
    const { data, error } = await supabase.from("profiles").select("full_name,role,active").eq("id", userId).maybeSingle();
    return { data, error };
  })();

  return { supabase, claims, profilePromise, error: null };
});

/** Share verified session and profile results across the layout and page render. */
export const getCurrentUserContext = cache(async () => {
  const authContext = await getCurrentAuthContext();
  if (!authContext.profilePromise) return { supabase: authContext.supabase, claims: authContext.claims, profile: null, error: authContext.error };
  const { data: profile, error: profileError } = await authContext.profilePromise;
  return { supabase: authContext.supabase, claims: authContext.claims, profile, error: profileError?.message ?? null };
});
