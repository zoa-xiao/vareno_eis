"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity, BarChart3, Boxes, ChevronDown, CircleHelp, ClipboardList, Factory, LayoutDashboard,
  LogOut, Menu, Package, Search, ShoppingBag, ShoppingCart, Users, WalletCards, X, Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type NavigationItem = { label: string; href: string; icon: LucideIcon };
const rolePaths: Record<string, string[]> = {
  Pemilik: ["/", "/products", "/purchases", "/inventory", "/production", "/sales", "/finance", "/reports", "/users", "/activity"],
  Admin: ["/", "/products", "/purchases", "/inventory", "/production", "/sales", "/finance", "/reports", "/users", "/activity"],
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

export function AppShell({ children, user }: { children: ReactNode; user: { name: string; role: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ key: string; title: string; detail: string; href: string }[]>([]);
  const [notificationError, setNotificationError] = useState("");

  const title = pathname === "/help" ? "Pusat Bantuan" : pathname === "/" ? "Dashboard" : navigation.flatMap((group) => group.items).find((item) => item.href === pathname)?.label ?? "Dashboard";
  const displayName = user.name;
  const displayRole = user.role;
  const roleKey = displayRole;
  const allowedPaths = rolePaths[roleKey] ?? ["/"];
  const visibleNavigation = navigation.map((group) => ({ ...group, items: group.items.filter((item) => allowedPaths.includes(item.href)) })).filter((group) => group.items.length > 0);
  const initials = displayName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const searchTargets = [...navigation.flatMap((group) => group.items), { label: "Pusat Bantuan", href: "/help", icon: CircleHelp }];
  const searchResults = search.trim() ? searchTargets.filter((item) => item.label.toLowerCase().includes(search.trim().toLowerCase()) && (item.href === "/help" || allowedPaths.includes(item.href))).slice(0, 6) : [];
  const pendingLabel = pendingHref ? searchTargets.find((item) => item.href === pendingHref)?.label ?? "halaman" : "";

  function warmRoute(href: string) {
    router.prefetch(href);
  }

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); searchInputRef.current?.focus();
      }
      if (event.key === "Escape") { setSearch(""); setNoticeOpen(false); setProfileOpen(false); }
    }
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPendingHref(null), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    if (!pendingHref) return;
    const timeout = window.setTimeout(() => setPendingHref(null), 20000);
    return () => window.clearTimeout(timeout);
  }, [pendingHref]);

  function startNavigation(href: string) {
    if (href !== pathname) setPendingHref(href);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!noticeOpen) return;
    let active = true;
    async function loadNotices() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) { setNotificationError("Koneksi Supabase tidak tersedia."); return; }
      try {
      const roleCanReadStock = ["Pemilik", "Admin", "Pengadaan", "Gudang", "Produksi", "Penjualan", "Keuangan"].includes(roleKey);
      const roleCanReadPurchases = ["Pemilik", "Admin", "Pengadaan", "Gudang", "Keuangan"].includes(roleKey);
      const roleCanReadProduction = ["Pemilik", "Admin", "Produksi", "Gudang", "Keuangan"].includes(roleKey);
      const checks = await Promise.all([
        roleCanReadStock ? supabase.from("stock_balances").select("item_code,item_name,quantity,minimum_stock") : Promise.resolve({ data: null, error: null }),
        roleCanReadPurchases ? supabase.from("purchase_orders").select("id,supplier_name").eq("status", "Menunggu Persetujuan").limit(5) : Promise.resolve({ data: null, error: null }),
        roleCanReadProduction ? supabase.from("production_orders").select("id,sku").eq("status", "Menunggu QC").limit(5) : Promise.resolve({ data: null, error: null }),
      ]);
      if (!active) return;
      const [stockResult, purchaseResult, productionResult] = checks;
      const firstError = checks.find((result) => result.error)?.error;
      setNotificationError(firstError?.message ?? "");
      const notices = [
        ...(stockResult.data ?? []).filter((item) => Number(item.quantity) <= Number(item.minimum_stock)).slice(0, 5).map((item) => ({ key: `stock-${item.item_code}`, title: "Stok mencapai batas minimum", detail: `${item.item_name} · ${item.quantity} tersisa`, href: "/inventory" })),
        ...(purchaseResult.data ?? []).map((item) => ({ key: `po-${item.id}`, title: "Pesanan menunggu persetujuan", detail: `${item.id} · ${item.supplier_name}`, href: "/purchases" })),
        ...(productionResult.data ?? []).map((item) => ({ key: `qc-${item.id}`, title: "Produksi menunggu QC", detail: `${item.id} · ${item.sku}`, href: "/production" })),
      ];
      setNotifications(notices);
      } catch {
        if (active) setNotificationError("Notifikasi Supabase gagal dimuat. Silakan muat ulang halaman.");
      }
    }
    void loadNotices();
    return () => { active = false; };
  }, [noticeOpen, roleKey]);

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
        </div>
        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {visibleNavigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-heading">{group.title}</div>
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} onMouseEnter={() => warmRoute(href)} onFocus={() => warmRoute(href)} onClick={() => startNavigation(href)} className={`nav-link${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
                    <span className={`nav-glyph nav-glyph-${href === "/" ? "home" : href.slice(1)}`}><Icon size={17} strokeWidth={active ? 2.2 : 1.85} /></span><span>{label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link className={`nav-link support-link${pathname === "/help" ? " active" : ""}`} href="/help" onMouseEnter={() => warmRoute("/help")} onFocus={() => warmRoute("/help")} onClick={() => startNavigation("/help")} aria-current={pathname === "/help" ? "page" : undefined}><span className="nav-glyph nav-glyph-support"><CircleHelp size={17} /></span><span>Pusat bantuan</span></Link>
          <div className="plan-card">
            <div className="plan-icon"><ClipboardList size={17} /></div>
            <strong>Operasional lebih rapi</strong>
            <p>Semua proses bisnis dalam satu ruang kerja.</p>
            <Link href="/reports" className="plan-link" onMouseEnter={() => warmRoute("/reports")} onFocus={() => warmRoute("/reports")} onClick={() => startNavigation("/reports")}>Lihat ringkasan <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
            <svg className="plan-weave" viewBox="0 0 104 90" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 72c10-17 20-18 29-3 10 17 22 15 35-6" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 5" />
              <path d="M41 19c12-9 27-5 32 6 5 12-5 19-15 25-11 7-14 17-8 26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="74" cy="27" r="15" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
              <path d="M74 21v12m-6-6h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="sidebar-footnote"><span className="status-dot" /> Sesi Supabase aktif <span className="version">v1.0</span></div>
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
          <div className="breadcrumbs"><svg className="breadcrumb-seal" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.8 21.2 8v8L12 21.2 2.8 16V8L12 2.8Z" stroke="currentColor" strokeWidth="1.3" /><path d="m7.3 12 3.1-3.1 3.1 3.1 3.2-3.1M12 12v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Vareno Studio</span><span className="crumb-slash">/</span><strong>{title}</strong>{pendingHref && <span className="navigation-status" role="status" aria-label={`Membuka ${pendingLabel}`}><span className="navigation-status-dot" />Membuka {pendingLabel}…</span>}</div>
          </div>
          <div className="topbar-actions">
            <div className="search-wrap"><label className="search-box"><Search size={17} /><input ref={searchInputRef} aria-label="Cari halaman" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari menu..." /><kbd>⌘ K</kbd></label>{search && <div className="search-results">{searchResults.length ? searchResults.map((item) => <Link key={item.href} href={item.href} onMouseEnter={() => warmRoute(item.href)} onFocus={() => warmRoute(item.href)} onClick={() => { setSearch(""); startNavigation(item.href); }}><item.icon size={15} /><span>{item.label}</span><span className="search-result-arrow">↗</span></Link>) : <div className="search-no-result">Tidak ada menu yang cocok</div>}</div>}</div>
            <span className="topbar-divider" />
            <button className={`icon-button notification-button${noticeOpen ? " selected" : ""}`} onClick={() => setNoticeOpen(!noticeOpen)} aria-label="Notifikasi" aria-expanded={noticeOpen}><Bell size={18} />{notifications.length > 0 && <i />}</button>
            <div className="profile-wrap">
              <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}>
                <span className="avatar">{initials}</span><span className="profile-copy"><strong>{displayName}</strong><small>{displayRole}</small></span><ChevronDown size={15} className="muted-icon" />
              </button>
              {profileOpen && <div className="profile-menu"><div className="profile-menu-header"><strong>{displayName}</strong><span>{user.email}</span></div><Link href="/help#users" onClick={() => setProfileOpen(false)}><CircleHelp size={15} /> Bantuan akun</Link><button onClick={signOut}><LogOut size={15} /> Keluar</button></div>}
            </div>
          </div>
          <svg className="topbar-stitch" viewBox="0 0 190 28" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M1 20c27-14 52-14 77 0 24 13 50 13 77-1 12-6 23-8 34-6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 5" /><circle cx="78" cy="20" r="2" fill="currentColor" /><path d="M142 7v7m-3.5-3.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
          {pendingHref && <div className="topbar-progress" aria-hidden="true"><span /></div>}
          {noticeOpen && <div className="notification-popover"><div className="popover-title"><strong>Perlu ditindaklanjuti</strong><button onClick={() => setNoticeOpen(false)} aria-label="Tutup notifikasi"><X size={15} /></button></div>{notificationError ? <div className="search-no-result">Notifikasi tidak dapat dibaca: {notificationError}</div> : notifications.length ? notifications.map((item) => <Link key={item.key} href={item.href} onClick={() => setNoticeOpen(false)} className="notice-item"><span className="notice-icon warning"><Boxes size={16} /></span><div><strong>{item.title}</strong><p>{item.detail}</p></div></Link>) : <div className="search-no-result">Tidak ada tindak lanjut saat ini.</div>}<Link href="/activity" onClick={() => setNoticeOpen(false)} className="all-notifications">Buka log aktivitas</Link></div>}
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
