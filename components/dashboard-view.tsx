"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Banknote, Boxes, CalendarDays, ChevronDown,
  CircleAlert, ClipboardCheck, Factory, ShoppingCart, Sparkles, TrendingUp,
} from "lucide-react";
import type { DashboardSnapshot } from "@/lib/dashboard-data";
import { formatCompactNumber, formatRupiah } from "@/lib/formatters";

const initialsTone: Record<string, string> = { lavender: "lavender", peach: "peach", mint: "mint", blue: "blue", rose: "rose" };

function FashionHeroArtwork() {
  return (
    <div className="hero-art" aria-hidden="true">
      <svg className="hero-art-svg" viewBox="0 0 440 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shirt-fill" x1="189" y1="79" x2="302" y2="202" gradientUnits="userSpaceOnUse"><stop stopColor="#FCFAFF" /><stop offset="1" stopColor="#DCD2FF" /></linearGradient>
          <linearGradient id="fabric-fill" x1="90" y1="34" x2="354" y2="223" gradientUnits="userSpaceOnUse"><stop stopColor="#C3B1FF" stopOpacity=".7" /><stop offset="1" stopColor="#9F83F0" stopOpacity=".06" /></linearGradient>
          <filter id="shirt-shadow" x="137" y="48" width="235" height="193" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feGaussianBlur in="SourceAlpha" stdDeviation="8" /><feOffset dy="8" /><feComponentTransfer><feFuncA type="linear" slope=".18" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <circle cx="260" cy="130" r="105" fill="url(#fabric-fill)" />
        <circle cx="260" cy="130" r="89" stroke="#E7DFFF" strokeOpacity=".48" strokeDasharray="2 7" />
        <path className="hero-thread" d="M85 171C129 119 157 204 203 150C237 111 257 104 291 119C323 133 338 171 392 102" stroke="#E5DCFF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 7" />
        <g className="hero-swatch hero-swatch-left" transform="rotate(-12 111 107)">
          <rect x="73" y="76" width="75" height="78" rx="12" fill="#fff" fillOpacity=".17" stroke="#fff" strokeOpacity=".28" />
          <rect x="84" y="88" width="53" height="34" rx="7" fill="#F6F2FF" fillOpacity=".9" />
          <path d="M91 110L101 98L110 106L118 96L131 112" stroke="#AB94EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M85 135H113" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" />
          <path d="M85 142H103" stroke="#fff" strokeOpacity=".48" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g className="hero-shirt">
          <path d="M252 54C252 45 267 42 272 51C274 56 271 62 266 66" stroke="#F8F4FF" strokeWidth="4" strokeLinecap="round" />
          <path d="M267 66L220 88L181 109L197 136L218 125L223 194H300L305 125L326 136L342 109L303 88L267 66Z" fill="url(#shirt-fill)" stroke="#fff" strokeWidth="2" strokeLinejoin="round" filter="url(#shirt-shadow)" />
          <path d="M239 80L258 101L279 80" stroke="#B9A8EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M258 101V185" stroke="#C9BDF0" strokeWidth="1.5" strokeDasharray="2 5" />
          <path d="M223 143L236 137M223 151L236 145M285 137L299 143" stroke="#C9BDF0" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M216 121L202 128M305 121L319 128" stroke="#A995E8" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="263" cy="116" r="2" fill="#9F87E8" /><circle cx="263" cy="130" r="2" fill="#9F87E8" /><circle cx="263" cy="144" r="2" fill="#9F87E8" />
        </g>
        <g className="hero-sparkle sparkle-a"><path d="M363 54V70M355 62H371" stroke="#F2EFFF" strokeWidth="2" strokeLinecap="round" /></g>
        <g className="hero-sparkle sparkle-b"><path d="M166 185V197M160 191H172" stroke="#E1D7FF" strokeWidth="2" strokeLinecap="round" /></g>
        <circle className="hero-orbit-dot" cx="357" cy="171" r="5" fill="#D4C6FF" />
        <circle cx="184" cy="62" r="3" fill="#FFF" fillOpacity=".76" />
      </svg>
      <div className="hero-float hero-float-stock"><span className="hero-live-mark" /><span><small>ALUR PRODUK</small><strong>Terpantau rapi</strong></span><Sparkles size={16} /></div>
      <div className="hero-float hero-float-colors"><span className="swatch-dot swatch-cream" /><span className="swatch-dot swatch-mauve" /><span className="swatch-dot swatch-violet" /><span className="swatch-caption">MATERIAL PALETTE</span></div>
    </div>
  );
}

function Chart({ values, labels }: { values: number[]; labels: string[] }) {
  const dimensions = { width: 720, height: 216, left: 8, right: 12, top: 14, bottom: 24 };
  const plotWidth = dimensions.width - dimensions.left - dimensions.right;
  const plotHeight = dimensions.height - dimensions.top - dimensions.bottom;
  const maxValue = Math.max(...values, 1);
  const scaleMax = Math.max(25_000_000, Math.ceil(maxValue / 25_000_000) * 25_000_000);
  const points = values.map((value, index) => ({
    x: dimensions.left + (values.length === 1 ? plotWidth / 2 : (index / (values.length - 1)) * plotWidth),
    y: dimensions.top + plotHeight - (value / scaleMax) * plotHeight,
  }));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const area = `${line} L${points[points.length - 1]?.x ?? 0},${dimensions.height - dimensions.bottom} L${points[0]?.x ?? 0},${dimensions.height - dimensions.bottom} Z`;
  return (
    <div className="chart-wrap">
      <div className="chart-y-labels">{[1, .75, .5, .25, 0].map((ratio) => <span key={ratio}>{ratio === 0 ? "Rp0" : `Rp${formatCompactNumber(scaleMax * ratio)}`}</span>)}</div>
      <div className="chart-plot">
        <svg viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} role="img" aria-label="Grafik tren penjualan VARENO">
          <defs><linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8f72ec" stopOpacity=".18" /><stop offset="100%" stopColor="#8f72ec" stopOpacity="0" /></linearGradient></defs>
          {[0, 1, 2, 3, 4].map((lineIndex) => {
            const y = dimensions.top + (plotHeight / 4) * lineIndex;
            return <line key={lineIndex} x1={0} x2={dimensions.width} y1={y} y2={y} className="chart-grid-line" />;
          })}
          <path d={area} fill="url(#sales-fill)" />
          <path d={line} pathLength="1" className="chart-line" />
          {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={index === points.length - 1 ? 5 : 3.5} className={index === points.length - 1 ? "chart-point current" : "chart-point"} />)}
        </svg>
        <div className="chart-x-labels">{labels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>
        <div className="chart-tooltip"><span>{labels[labels.length - 1] ?? "Periode terbaru"}</span><strong>{formatRupiah(values[values.length - 1] ?? 0)}</strong><small>penjualan tercatat pada bulan ini</small></div>
      </div>
    </div>
  );
}

function MetricArtwork({ index }: { index: number }) {
  const art = [
    <g key="sales">
      <rect x="10" y="13" width="46" height="33" rx="7" fill="white" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 35l9-8 7 5 12-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M39 20h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 40h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".45" />
      <circle cx="50" cy="12" r="3" fill="currentColor" opacity=".2" />
    </g>,
    <g key="stock">
      <path d="m33 10 20 11v22L33 54 13 43V21l20-11Z" fill="white" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m13 21 20 12 20-12M33 33v21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m22 16 20 12v7M29 13l20 12v7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity=".55" />
      <path d="m25 39 5 3v6l-5-3v-6Z" fill="currentColor" opacity=".26" />
    </g>,
    <g key="production">
      <path d="M9 47V28l14 8V25l14 9V18l17 10v19H9Z" fill="white" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M17 42v-6M27 42v-6M38 42v-6M47 42v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M42 13c-2-3 2-4 0-7M49 16c-2-3 2-4 0-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
      <circle cx="14" cy="20" r="2" fill="currentColor" opacity=".25" />
    </g>,
    <g key="profit">
      <circle cx="24" cy="34" r="17" fill="white" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="24" cy="34" r="12" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" opacity=".5" />
      <path d="M24 26v16M28 29c-1-2-6-2-7 1-1 4 7 2 7 6-1 3-6 4-8 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m35 39 8-8 5 4 8-11M48 24h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="51" cy="17" r="3" fill="currentColor" opacity=".22" />
    </g>,
  ];

  return <svg className={`metric-art metric-art-${index}`} viewBox="0 0 66 62" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">{art[index]}</svg>;
}

export function DashboardView({ snapshot }: { snapshot: DashboardSnapshot }) {
  const [period, setPeriod] = useState("6m");
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState("");
  const values = useMemo(() => period === "12m" ? snapshot.sales : snapshot.sales.slice(-6), [period, snapshot.sales]);
  const chartLabels = period === "12m" ? snapshot.monthLabels : snapshot.monthLabels.slice(-6);

  function exportCsv() {
    const header = "Nomor transaksi,Pelanggan,Tanggal,Nilai,Status";
    const rows = snapshot.recentSales.map((row) => [row.id, row.customer, row.date, row.amount, row.status].join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "ringkasan-penjualan-vareno.csv";
    anchor.click();
    URL.revokeObjectURL(href);
    setToast("Laporan penjualan berhasil diunduh.");
    window.setTimeout(() => setToast(""), 2600);
  }

  const visibleSales = showAll ? snapshot.recentSales : snapshot.recentSales.slice(0, 4);

  return (
    <div className="dashboard-page">
      <div className="page-heading dashboard-heading">
        <div>
          <div className="eyebrow-row"><span className="eyebrow">RINGKASAN BISNIS</span><span className="live-pill"><i /> DATA SUPABASE</span></div>
          <h1>Selamat datang, {snapshot.greetingName} <span className="greeting-sun">✦</span></h1>
          <p>Pantau performa dan aktivitas bisnis VARENO hari ini.</p>
        </div>
        <div className="heading-actions">
          <span className="secondary-button date-button"><CalendarDays size={16} /><span>Data aktual · 12 bulan</span></span>
          <Link href="/sales" className="primary-button"><svg className="button-spark" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="9" cy="9" r="7.2" stroke="currentColor" strokeWidth="1.1" opacity=".36" /></svg> Buat transaksi</Link>
        </div>
      </div>

      {snapshot.error && <div className="database-error" role="alert"><strong>Data dashboard belum dapat dimuat.</strong><span>{snapshot.error}</span><Link href="/help#database">Periksa koneksi dan migrasi di Pusat Bantuan</Link></div>}

      <section className="dashboard-hero">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="hero-kicker-dot" />VARENO BUSINESS STUDIO <span className="hero-kicker-separator">/</span> 2026</div>
          <h2>Dari bahan ke produk,<br /><em>semua terhubung.</em></h2>
          <p>Satu ruang untuk melihat koleksi, stok, produksi, dan pesanan berjalan seirama.</p>
          <div className="hero-bottom-row">
            <div className="hero-facts"><span><strong>Live</strong> data Supabase</span><i /><span><strong>Aktual</strong> transaksi</span><i /><span><strong>Terhubung</strong> antar modul</span></div>
            <Link href="/products" className="hero-cta">Jelajahi katalog <ArrowRight size={15} /></Link>
          </div>
        </div>
        <FashionHeroArtwork />
        <div className="hero-decoration hero-decoration-one" />
        <div className="hero-decoration hero-decoration-two" />
      </section>

      <section className="metric-grid" aria-label="Ringkasan kinerja">
        {snapshot.metrics.map((metric, index) => {
          const icons = [Banknote, Boxes, Factory, TrendingUp];
          const Icon = icons[index];
          const hasTrend = /^\+/.test(metric.change);
          return (
            <article className="metric-card" key={metric.label}>
              <MetricArtwork index={index} />
              <div className="metric-top"><span className={`metric-icon metric-icon-${index}`}><Icon size={18} strokeWidth={1.9} /></span><Link className="subtle-icon" aria-label={`Buka modul ${metric.label}`} href={["/sales", "/inventory", "/production", "/reports"][index]}><ArrowRight size={16} /></Link></div>
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-foot"><span className={`metric-change ${metric.direction === "up" ? "positive" : "negative"}`}>{hasTrend ? metric.direction === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} /> : null}{metric.change}</span><span>{metric.note}</span></div>
            </article>
          );
        })}
      </section>

      <div className="dashboard-main-grid">
        <section className="panel sales-panel">
          <div className="panel-heading">
            <div><div className="panel-title">Tren penjualan</div><div className="panel-subtitle">Performa penjualan VARENO dari waktu ke waktu</div></div>
            <label className="select-wrap"><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Rentang grafik"><option value="6m">6 bulan</option><option value="12m">12 bulan</option></select><ChevronDown size={14} /></label>
          </div>
          {snapshot.readAccess.sales ? <><div className="chart-summary"><strong>{snapshot.metrics[0].value}</strong><span className={`metric-change ${snapshot.metrics[0].direction === "up" ? "positive" : "negative"}`}>{snapshot.metrics[0].change}</span><small>total penjualan bulan ini · Supabase</small></div><Chart values={values} labels={chartLabels} /><div className="chart-legend"><span><i className="legend-dot actual" />Penjualan aktual</span><button onClick={exportCsv}>Unduh laporan <ArrowRight size={14} /></button></div></> : <div className="empty-state">Peran Anda tidak memiliki akses baca ke data penjualan.</div>}
        </section>

        <section className="panel category-panel">
          <div className="panel-heading"><div><div className="panel-title">Penjualan per kategori</div><div className="panel-subtitle">Kontribusi kategori dari transaksi Supabase</div></div><Link href="/reports" className="subtle-icon" aria-label="Lihat laporan kategori"><ArrowRight size={16} /></Link></div>
          {!snapshot.readAccess.sales ? <div className="empty-state category-empty">Peran Anda tidak memiliki akses baca ke data penjualan.</div> : snapshot.categories.length ? <><div className="category-total"><strong>{snapshot.metrics[0].value}</strong><span><TrendingUp size={14} /> Aktual</span></div><div className="category-bars">{snapshot.categories.map((category) => <div className="category-row" key={category.label}><div className="category-line"><span>{category.label}</span><strong>{category.amount}</strong></div><div className="progress-track"><span style={{ width: `${category.value}%`, backgroundColor: category.color }} /></div><small>{category.hint}</small></div>)}</div><Link href="/reports" className="text-link category-link">Lihat laporan lengkap <ArrowRight size={15} /></Link></> : <div className="empty-state category-empty">Belum ada item penjualan berkategori pada periode ini.</div>}
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="panel table-panel">
          <div className="panel-heading table-panel-heading"><div><div className="panel-title">Transaksi terbaru</div><div className="panel-subtitle">Pesanan penjualan yang baru masuk</div></div><Link href="/sales" className="secondary-button compact-button">Semua transaksi <ArrowRight size={14} /></Link></div>
          <div className="table-scroll"><table className="data-table recent-table"><thead><tr><th>Transaksi</th><th>Pelanggan</th><th>Tanggal</th><th>Total</th><th>Status</th></tr></thead><tbody>{visibleSales.length ? visibleSales.map((sale) => <tr key={sale.id}><td className="transaction-id">{sale.id}</td><td><div className="customer-cell"><span className={`customer-avatar ${initialsTone[sale.tone] ?? "lavender"}`}>{sale.initials}</span><span>{sale.customer}</span></div></td><td className="muted-cell">{sale.date}</td><td className="amount-cell">{sale.amount}</td><td><span className={`status-pill ${sale.status === "Selesai" ? "status-success" : sale.status === "Diproses" ? "status-progress" : "status-pending"}`}><i />{sale.status}</span></td></tr>) : <tr><td colSpan={5}><div className="empty-state">Belum ada transaksi penjualan pada periode ini.</div></td></tr>}</tbody></table></div>
          {snapshot.recentSales.length > 4 && <button className="show-more" onClick={() => setShowAll(!showAll)}>{showAll ? "Tampilkan lebih sedikit" : "Lihat transaksi lainnya"}<ChevronDown size={14} className={showAll ? "rotate-up" : ""} /></button>}
        </section>

        <section className="panel attention-panel">
          <div className="panel-heading"><div><div className="panel-title">Perlu perhatian</div><div className="panel-subtitle">Hal yang membutuhkan tindak lanjut</div></div><span className="attention-count">{snapshot.alerts.length + snapshot.pendingQc + snapshot.pendingApprovals}</span></div>
          <div className="attention-list">
            {snapshot.readAccess.stock && snapshot.alerts.slice(0, 2).map((alert) => <Link href="/inventory" className="attention-item" key={alert.code}><span className="attention-icon stock"><CircleAlert size={17} /></span><span className="attention-copy"><strong>Stok menipis</strong><small>{alert.name} · {alert.stock} tersisa</small></span><ArrowRight size={15} className="attention-arrow" /></Link>)}
            {snapshot.readAccess.production && snapshot.pendingQc > 0 && <Link href="/production" className="attention-item"><span className="attention-icon qc"><ClipboardCheck size={17} /></span><span className="attention-copy"><strong>{snapshot.pendingQc} perintah menunggu QC</strong><small>Hasil produksi perlu diperiksa</small></span><ArrowRight size={15} className="attention-arrow" /></Link>}
            {snapshot.readAccess.purchases && snapshot.pendingApprovals > 0 && <Link href="/purchases" className="attention-item"><span className="attention-icon po"><ShoppingCart size={17} /></span><span className="attention-copy"><strong>{snapshot.pendingApprovals} PO perlu persetujuan</strong><small>Periksa permintaan pembelian</small></span><ArrowRight size={15} className="attention-arrow" /></Link>}
            {snapshot.alerts.length === 0 && snapshot.pendingQc === 0 && snapshot.pendingApprovals === 0 && <div className="empty-state">Tidak ada tindak lanjut pada data yang dapat Anda akses.</div>}
          </div>
          <Link href="/inventory" className="text-link attention-link">Buka pusat aktivitas <ArrowRight size={15} /></Link>
        </section>
      </div>
      {toast && <div className="toast-message dashboard-toast" role="status">{toast}<button onClick={() => setToast("")} aria-label="Tutup">×</button></div>}
    </div>
  );
}
