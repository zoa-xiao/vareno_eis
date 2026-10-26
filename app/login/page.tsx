"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

function Brand() {
  return <Link href="/" className="brand login-brand"><span className="brand-mark"><span /><span /><span /><span /></span><span className="brand-wordmark">VARENO<span>ERP</span></span></Link>;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const configured = hasSupabaseConfig();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di .env.local, lalu muat ulang aplikasi.");
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError("Email atau kata sandi belum sesuai. Periksa kembali lalu coba lagi.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Supabase tidak dapat dijangkau. Periksa koneksi internet dan konfigurasi proyek.");
    } finally {
      setLoading(false);
    }
  }

  async function demoLogin() {
    setError("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi. Isi variabel koneksi Supabase di .env.local.");
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let demoUser = session?.user.is_anonymous ? session.user : null;
      if (!demoUser) {
        const { data, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) {
          const message = authError.message.toLowerCase();
          setError(message.includes("anonymous") || message.includes("disabled")
            ? "Aktifkan Anonymous Sign-ins di pengaturan Authentication Supabase, lalu jalankan migration demo yang disediakan."
            : `Login demo Supabase gagal: ${authError.message}`);
          return;
        }
        demoUser = data.user;
      }
      if (!demoUser) {
        setError("Supabase tidak mengembalikan sesi demo. Silakan coba lagi.");
        return;
      }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role,active").eq("id", demoUser.id).maybeSingle();
      if (profileError || !profile?.active || profile.role !== "Admin") {
        await supabase.auth.signOut();
        setError("Akses demo belum disiapkan. Jalankan migration demo Supabase, lalu coba lagi.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Supabase tidak dapat dijangkau. Periksa koneksi proyek Anda.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setError("");
    if (!email.trim()) {
      setError("Masukkan alamat email Anda terlebih dahulu untuk menerima link reset.");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi. Isi variabel koneksi Supabase di .env.local.");
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/login` });
      setError(resetError ? resetError.message : "Jika email terdaftar, link reset kata sandi akan segera dikirim.");
    } catch {
      setError("Supabase tidak dapat dijangkau. Periksa koneksi proyek Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-left">
        <div className="login-left-inner">
          <Brand />
          <div className="login-copy">
            <span className="eyebrow">RUANG KERJA TERINTEGRASI</span>
            <h1>Bisnis bergerak lebih jauh ketika semua terhubung.</h1>
            <p>Kelola produk, persediaan, produksi, penjualan, dan keuangan dari satu tempat.</p>
            <div className="login-illustration" aria-label="Ilustrasi alur kerja VARENO">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
              <div className="illustration-core">
                <svg className="login-mascot" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Maskot gulungan benang VARENO">
                  <path d="M30 27C30 20 42 16 55 16C68 16 80 20 80 27V78C80 85 68 90 55 90C42 90 30 85 30 78V27Z" fill="#B7A1F2" stroke="#FFF" strokeWidth="2.5" />
                  <ellipse cx="55" cy="27" rx="25" ry="10" fill="#D7CCFA" stroke="#FFF" strokeWidth="2.5" />
                  <path d="M30 39C42 49 68 49 80 39M30 68C42 78 68 78 80 68" stroke="#8C71D5" strokeWidth="2" />
                  <path className="mascot-eye" d="M44 53V56M66 53V56" stroke="#38265B" strokeWidth="4" strokeLinecap="round" />
                  <path d="M47 64Q55 71 64 63" stroke="#38265B" strokeWidth="2.5" strokeLinecap="round" />
                  <path className="mascot-arm mascot-arm-left" d="M31 57L20 49L14 39" stroke="#D7CCFA" strokeWidth="7" strokeLinecap="round" /><circle cx="14" cy="38" r="5" fill="#FFF" />
                  <path className="mascot-arm mascot-arm-right" d="M79 58L91 50L96 37" stroke="#D7CCFA" strokeWidth="7" strokeLinecap="round" /><circle cx="97" cy="35" r="5" fill="#FFF" />
                  <path className="mascot-thread" d="M56 16C56 8 67 10 68 5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" /><circle cx="68" cy="5" r="2.5" fill="#F0C66F" />
                </svg>
              </div>
              <div className="float-card float-sales"><span className="float-icon sales"><ArrowRight size={15} /></span><span><small>RUANG KERJA</small><strong>Semua proses</strong></span><i>VARENO</i></div>
              <div className="float-card float-stock"><span className="stock-bars"><i /><i /><i /><i /><i /></span><span><small>TERINTEGRASI</small><strong>Satu alur kerja</strong></span></div>
              <div className="float-bubble bubble-one" aria-hidden="true">✦</div><div className="float-bubble bubble-two" aria-hidden="true">+</div>
            </div>
          </div>
          <div className="login-footer"><span>© 2026 VARENO Studio</span><span>Dashboard perusahaan</span></div>
        </div>
      </section>
      <section className="login-right">
        <div className="login-form-wrap">
          <div className="login-mobile-brand"><Brand /></div>
          <span className="eyebrow">SELAMAT DATANG KEMBALI</span>
          <h2>Masuk ke akun Anda</h2>
          <p className="login-subtitle">Gunakan akun VARENO untuk melanjutkan ke dashboard.</p>
          {!configured && <div className="login-error" role="status">Supabase belum dikonfigurasi. Isi variabel koneksi Supabase di .env.local untuk mengaktifkan dashboard.</div>}
          <form className="login-form" onSubmit={submit}>
            <label className="login-field"><span>Email</span><div className="login-input"><Mail size={17} /><input type="email" autoComplete="username" placeholder="nama@vareno.id" value={email} onChange={(event) => setEmail(event.target.value)} required /><span /></div></label>
            <label className="login-field"><span>Kata sandi</span><div className="login-input"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan kata sandi" value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            <div className="login-options"><span /><button type="button" onClick={resetPassword} disabled={loading}>Lupa kata sandi?</button></div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button type="submit" className="primary-button login-submit" disabled={loading || !configured}>{loading ? "Memeriksa akun..." : "Masuk ke dashboard"}<ArrowRight size={17} /></button>
            <div className="login-demo-divider"><span />atau<span /></div>
            <button type="button" className="login-demo-button" onClick={demoLogin} disabled={loading || !configured}>
              <Sparkles size={16} />{loading ? "Menyiapkan demo..." : "Masuk demo"}
            </button>
          </form>
          <div className="login-security"><span className="secure-dot" /> Autentikasi dan data diambil dari Supabase</div>
        </div>
        <div className="login-bottom">Akun dikelola admin perusahaan melalui Supabase.</div>
      </section>
    </main>
  );
}
