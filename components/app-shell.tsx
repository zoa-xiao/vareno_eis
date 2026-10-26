"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Activity, BarChart3, Boxes, ChevronDown, CircleHelp, ClipboardList, Factory, LayoutDashboard,
  LogOut, Menu, Package, Search, Settings2, ShoppingBag, ShoppingCart, Users, WalletCards, X, Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type NavigationItem = { label: string; href: string; icon: LucideIcon };
const rolePaths: Record<string, string[]> = {
  Pemilik: ["/", "/products", "/purchases", "/inventory", "/production", "/sales", "/finance", "/reports", "/users", "/activity"],
  Admin: ["/", "/products", "/users", "/activity"],
  Pengadaan: ["/", "/products", "/purchases", "/inventory"],
  Gudang: ["/", "/inventory", "/purchases", "/production"],
  Produksi: ["/", "/products", "/inventory", "/production"],
  Penjualan: ["/", "/products", "/inventory", "/sales"],
  Keuangan: ["/", "/purchases", "/sales", "/finance", "/reports"],
};
const navigation: { title: string; items: NavigationItem[] }[] = [
  { title: "UMUM", items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }] },
  {
    title: "OPERASIONAL",
    items: [
      { label: "Produk & BOM", href: "/products", icon: Package },
      { label: "Pengadaan", href: "/purchases", icon: ShoppingCart },
      { label: "Persediaan", href: "/inventory", icon: Boxes },
      { label: "Produksi", href: "/production", icon: Factory },
      { label: "Penjualan", href: "/sales", icon: ShoppingBag },
    ],
  },
  { title: "KEUANGAN", items: [{ label: "Keuangan", href: "/finance", icon: WalletCards }, { label: "Laporan & KPI", href: "/reports", icon: BarChart3 }] },
  { title: "PENGATURAN", items: [{ label: "Pengguna", href: "/users", icon: Users }, { label: "Log aktivitas", href: "/activity", icon: Activity }] },
];

function Logo() {
  return (
    <Link href="/" className="brand" aria-label="VARENO ERP dashboard">
      <span className="brand-mark"><span /><span /><span /><span /></span>
      <span className="brand-wordmark">VARENO<span>ERP</span></span>
    </Link>
  );
}

export function AppShell({ children, demoMode, user }: { children: ReactNode; demoMode: boolean; user?: { name: string; role: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const title = pathname === "/" ? "Dashboard" : navigation.flatMap((group) => group.items).find((item) => item.href === pathname)?.label ?? "Dashboard";
  const displayName = user?.name ?? "Aditya Pramana";
  const displayRole = user?.role ?? "Pemilik Bisnis";
  const roleKey = displayRole === "Pemilik Bisnis" ? "Pemilik" : displayRole;
  const allowedPaths = rolePaths[roleKey] ?? ["/"];
  const visibleNavigation = navigation.map((group) => ({ ...group, items: group.items.filter((item) => allowedPaths.includes(item.href)) })).filter((group) => group.items.length > 0);
  const initials = displayName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function renderSidebar(): ReactNode {
    return (
      <>
        <div className="sidebar-brand-row"><Logo /><button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Tutup menu"><X size={19} /></button></div>
        <div className="company-switcher">
          <div className="company-avatar">V</div>
          <div className="company-copy"><strong>Vareno Studio</strong><span>Workspace utama</span></div>
          <svg className="company-weave" viewBox="0 0 82 62" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 48c12-20 23-20 34-1s21 18 30-4" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 4" />
            <path d="M20 17c9 0 13 8 19 14 7 8 16 9 25 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M23 14v6m-3-3h6M67 42v7m-3.5-3.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="47" cy="19" r="3" fill="currentColor" opacity=".45" />
          </svg>
          <ChevronDown size={15} className="muted-icon" />
        </div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {visibleNavigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-heading">{group.title}</div>
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`nav-link${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
                    <span className={`nav-glyph nav-glyph-${href === "/" ? "home" : href.slice(1)}`}><Icon size={17} strokeWidth={active ? 2.2 : 1.85} /></span><span>{label}</span>
                    {label === "Persediaan" && <span className="nav-count">8</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-link support-link" onClick={() => setNotice("Pusat bantuan VARENO siap membantu tim Anda.")}><span className="nav-glyph nav-glyph-support"><CircleHelp size={17} /></span><span>Pusat bantuan</span></button>
          <div className="plan-card">
            <div className="plan-icon"><ClipboardList size={17} /></div>
            <strong>Operasional lebih rapi</strong>
            <p>Semua proses bisnis dalam satu ruang kerja.</p>
            <Link href="/reports" className="plan-link" onClick={() => setMobileOpen(false)}>Lihat ringkasan <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
            <svg className="plan-weave" viewBox="0 0 104 90" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 72c10-17 20-18 29-3 10 17 22 15 35-6" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 5" />
              <path d="M41 19c12-9 27-5 32 6 5 12-5 19-15 25-11 7-14 17-8 26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="74" cy="27" r="15" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
              <path d="M74 21v12m-6-6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="sidebar-footnote"><span className="status-dot" /> Sistem berjalan normal <span className="version">v1.0</span></div>
        </div>
      </>
    );
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">{renderSidebar()}</aside>
      {mobileOpen && <div className="mobile-scrim" onClick={() => setMobileOpen(false)}><aside className="mobile-sidebar" onClick={(event) => event.stopPropagation()}>{renderSidebar()}</aside></div>}
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-leading">
            <button className="icon-button mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Buka menu"><Menu size={20} /></button>
            <div className="breadcrumbs"><svg className="breadcrumb-seal" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.8 21.2 8v8L12 21.2 2.8 16V8L12 2.8Z" stroke="currentColor" strokeWidth="1.3" /><path d="m7.3 12 3.1-3.1 3.1 3.1 3.2-3.1M12 12v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Vareno Studio</span><span className="crumb-slash">/</span><strong>{title}</strong></div>
          </div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={17} /><input aria-label="Cari" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari apa saja..." /><kbd>⌘ K</kbd></label>
            <span className="topbar-divider" />
            <button className={`icon-button notification-button${noticeOpen ? " selected" : ""}`} onClick={() => setNoticeOpen(!noticeOpen)} aria-label="Notifikasi"><Bell size={18} /><i /></button>
            <div className="profile-wrap">
              <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}>
                <span className="avatar">{initials}</span><span className="profile-copy"><strong>{displayName}</strong><small>{displayRole}</small></span><ChevronDown size={15} className="muted-icon" />
              </button>
              {profileOpen && <div className="profile-menu"><div className="profile-menu-header"><strong>{displayName}</strong><span>{user?.email ?? "aditya@vareno.id"}</span></div><Link href="/users" onClick={() => setProfileOpen(false)}><Settings2 size={15} /> Pengaturan akun</Link><button onClick={signOut}><LogOut size={15} /> Keluar</button></div>}
            </div>
          </div>
          <svg className="topbar-stitch" viewBox="0 0 190 28" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M1 20c27-14 52-14 77 0 24 13 50 13 77-1 12-6 23-8 34-6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 5" /><circle cx="78" cy="20" r="2" fill="currentColor" /><path d="M142 7v7m-3.5-3.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
          {noticeOpen && <div className="notification-popover"><div className="popover-title"><strong>Notifikasi</strong><button onClick={() => setNoticeOpen(false)}>Tandai dibaca</button></div><div className="notice-item"><span className="notice-icon warning"><Boxes size={16} /></span><div><strong>8 item stok menipis</strong><p>Beberapa bahan baku perlu segera dipesan.</p><small>12 menit lalu</small></div></div><div className="notice-item"><span className="notice-icon violet"><ShoppingCart size={16} /></span><div><strong>Persetujuan pesanan pembelian</strong><p>PO-2026-0084 menunggu persetujuan Anda.</p><small>1 jam lalu</small></div></div><Link href="/inventory" onClick={() => setNoticeOpen(false)} className="all-notifications">Lihat semua aktivitas</Link></div>}
        </header>
        {demoMode && <div className="demo-banner"><span className="demo-sparkle">✦</span> Mode pratinjau · Data yang tampil adalah data contoh</div>}
        <main className="main-content">{children}</main>
        {notice && <div className="toast-message" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Tutup">×</button></div>}
      </div>
    </div>
  );
}
