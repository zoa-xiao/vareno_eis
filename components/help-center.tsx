"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, Boxes, CircleHelp, Database, Factory, FileText, LifeBuoy, Package, Search, Send, ShieldCheck, ShoppingBag, ShoppingCart, WalletCards } from "lucide-react";
import { useRouter } from "next/navigation";

type SupportTicket = { id: string; subject: string; category: string; status: string; createdAt: string };

const articles = [
  { id: "database", category: "Mulai", title: "Menghubungkan proyek Supabase", description: "Dashboard hanya memakai data Supabase. Tidak ada data pratinjau maupun fallback.", icon: Database, content: ["Pastikan .env.local berisi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Jangan menambahkan service role key dengan awalan NEXT_PUBLIC_.", "Jika skema awal belum pernah dipasang, jalankan 202610260001_initial_schema.sql terlebih dahulu. Setelah itu jalankan 202610260002_workflows.sql satu kali. Jangan jalankan ulang migrasi awal jika tabel sudah ada.", "Jika database baru dan kosong, Anda boleh menjalankan supabase/seed.sql setelah kedua migrasi untuk mengisi data awal. Jangan jalankan seed pada database yang sudah berisi data perusahaan.", "Buat pengguna di Authentication, lalu buat profil terkait di public.profiles dengan id yang sama seperti auth.users.id dan peran yang sesuai. Setelah itu login ke aplikasi.", "Jika terlihat error skema, buka Logs pada Supabase dan pastikan kedua migrasi sudah diterapkan. Aplikasi menampilkan error alih-alih mengganti data dengan contoh."] },
  { id: "products", category: "Operasional", title: "Produk, varian, harga jual, dan BOM", description: "Harga, resep bahan, dan varian produk menjadi dasar produksi dan transaksi.", icon: Package, href: "/products", content: ["Buka Produk & BOM, lalu pilih Tambah produk. Isi nama produk, model, kategori, SKU unik, nama varian, ukuran, warna, harga jual, HPP, dan stok minimum.", "Harga dan HPP dimasukkan sebagai angka rupiah, tanpa titik atau simbol Rp. Contoh: 640000 berarti Rp640.000.", "Pilih Atur BOM untuk menambahkan satu bahan baku dan jumlah yang dibutuhkan untuk setiap unit produk. Ulangi untuk semua bahan yang dipakai; komposisi bahan yang sama dapat diperbarui.", "BOM aktif wajib tersedia sebelum hasil QC dicatat. QC memotong bahan sesuai jumlah yang diperiksa dan menambah stok produk jadi sesuai jumlah yang lolos.", "Perubahan harga pada rincian varian hanya berlaku untuk transaksi berikutnya. Transaksi yang sudah dibuat tetap memakai harga saat transaksi dibuat."] },
  { id: "purchases", category: "Operasional", title: "Pesanan pembelian dan data pemasok/bahan", description: "Pengadaan membuat data induk dan pesanan, Pemilik menyetujui, Gudang mencatat penerimaan.", icon: ShoppingCart, href: "/purchases", content: ["Peran Pengadaan menambahkan pemasok atau bahan baku lewat tombol di bagian atas halaman. Isi satuan bahan dengan meter, kg, pcs, atau satuan yang benar.", "Hanya Pengadaan dapat membuat pesanan pembelian. Pemilik menyetujui pesanan yang dibuat pengguna lain, sehingga pembuat tidak menyetujui pesanannya sendiri.", "Setelah disetujui, Gudang atau Pemilik membuka pesanan dan mencatat jumlah diterima. Penerimaan menambah saldo bahan baku secara otomatis.", "Penerimaan sebagian dapat dilakukan beberapa kali. Jumlah tidak boleh melebihi sisa kuantitas pesanan."] },
  { id: "inventory", category: "Operasional", title: "Mutasi persediaan", description: "Saldo dihitung dari seluruh mutasi masuk dan keluar yang tersimpan.", icon: Boxes, href: "/inventory", content: ["Pilih Catat mutasi untuk item yang sudah terdaftar di master bahan atau varian produk.", "Pilih Stok masuk atau Stok keluar, jumlah, serta alasan. Stok keluar akan ditolak jika saldo tidak mencukupi.", "Penerimaan pembelian, hasil produksi QC, dan pemenuhan penjualan membuat mutasi secara otomatis agar saldo tetap konsisten.", "Jangan mengubah saldo langsung pada tampilan ringkasan; koreksi dicatat sebagai mutasi dengan alasan yang jelas."] },
  { id: "production", category: "Operasional", title: "Perintah produksi dan pemeriksaan QC", description: "Perintah, pemakaian BOM, hasil lolos, dan saldo produk jadi tetap saling terkait.", icon: Factory, href: "/production", content: ["Buat perintah dengan memilih SKU, jumlah, dan tanggal target. Produk perlu memiliki varian aktif.", "Ubah status dari Direncanakan ke Diproses, lalu ke Menunggu QC saat siap diperiksa.", "Saat mencatat QC, jumlah lolos, perbaikan, dan gagal harus sama dengan jumlah yang diperiksa.", "BOM aktif wajib disiapkan melalui halaman Produk & BOM sebelum QC. Bahan baku terpotong sesuai BOM dan jumlah unit yang diperiksa. Unit yang lolos QC menambah stok produk jadi. Kekurangan stok bahan membatalkan seluruh transaksi QC."] },
  { id: "sales", category: "Operasional", title: "Pelanggan, penjualan, pemenuhan, dan pembayaran", description: "Kelola pelanggan lalu proses transaksi sampai pembayaran tercatat.", icon: ShoppingBag, href: "/sales", content: ["Peran Penjualan menambahkan pelanggan melalui tombol Tambah pelanggan di halaman Penjualan.", "Buat transaksi dengan memilih pelanggan, SKU, jumlah, dan diskon total. Sistem mengambil harga jual dari produk.", "Penuhi pesanan setelah barang siap dikirim. Stok produk jadi berkurang dan sistem menolak jika stok tidak cukup.", "Catat pembayaran sesuai nilai transaksi. Pembayaran tampil di Keuangan sebagai Menunggu Verifikasi.", "Peran Keuangan atau Pemilik memverifikasi pembayaran; status pembayaran menjadi Sebagian atau Lunas berdasarkan nilai yang diverifikasi."] },
  { id: "finance", category: "Keuangan", title: "Biaya dan verifikasi arus kas", description: "Catatan biaya dan transaksi keuangan berada di database yang sama.", icon: WalletCards, href: "/finance", content: ["Gunakan Catat biaya untuk menyimpan kategori, nilai, keterangan, dan tanggal.", "Setiap biaya menghasilkan transaksi kas keluar berstatus Menunggu Verifikasi.", "Keuangan atau Pemilik dapat memverifikasi atau membatalkan transaksi yang masih menunggu.", "Nilai arus kas terverifikasi dihitung dari financial_transactions. Biaya yang masih menunggu belum masuk saldo terverifikasi."] },
  { id: "users", category: "Akun & akses", title: "Pengguna dan hak akses", description: "Profil harus aktif dan terhubung ke akun Supabase Auth.", icon: ShieldCheck, href: "/users", content: ["Authentication di Supabase mengelola akun login. public.profiles mengelola nama, peran, dan status aktif.", "Untuk mengundang akun dari aplikasi, server perlu SUPABASE_SERVICE_ROLE_KEY di environment server. Jangan pernah memakai awalan NEXT_PUBLIC_ untuk key ini.", "Jika key admin tidak tersedia, undang akun dari Supabase Authentication terlebih dahulu, lalu tautkan auth.users.id ke public.profiles.id dengan peran yang benar.", "Peran mengatur modul yang bisa dilihat dan tindakan yang dapat disimpan. RLS Supabase tetap menjadi pengaman terakhir."] },
  { id: "reports", category: "Analisis", title: "Laporan dan ekspor CSV", description: "Ekspor mengambil baris yang sedang ditampilkan setelah pencarian dan filter.", icon: FileText, href: "/reports", content: ["Gunakan pencarian atau filter status untuk membatasi daftar.", "Pilih Ekspor CSV untuk mengunduh data yang sedang terlihat.", "Laporan dan KPI merangkum tabel transaksi, saldo, produksi, dan keuangan yang dapat diakses akun Anda."] },
  { id: "activity", category: "Akun & akses", title: "Log aktivitas", description: "Aktivitas operasional penting dicatat untuk membantu penelusuran.", icon: BookOpen, href: "/activity", content: ["Log berasal dari audit_logs dan tidak dibuat dari data contoh.", "Ekspor CSV mengunduh log yang sedang ditampilkan.", "Log dapat dibaca Pemilik dan Admin sesuai kebijakan RLS."] },
];

function ticketDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function HelpCenter({ tickets: initialTickets, ticketError, role = "" }: { tickets: SupportTicket[]; ticketError: string | null; role?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [tickets, setTickets] = useState(initialTickets);
  const [subject, setSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Data");
  const [message, setMessage] = useState("");
  const [ticketBusy, setTicketBusy] = useState(false);
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketErrorState, setTicketErrorState] = useState("");
  const categories = ["Semua", ...Array.from(new Set(articles.map((article) => article.category)))];
  const canManageTickets = ["Pemilik", "Admin"].includes(role);
  const filtered = useMemo(() => articles.filter((article) => {
    const matchesCategory = category === "Semua" || article.category === category;
    const haystack = `${article.title} ${article.description} ${article.content.join(" ")}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase().trim());
  }), [category, query]);

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setTicketBusy(true); setTicketErrorState(""); setTicketMessage("");
    try {
      const response = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, category: ticketCategory, message }) });
      const result = await response.json() as { error?: string; id?: string };
      if (!response.ok) throw new Error(result.error ?? "Tiket bantuan gagal dikirim.");
      setTickets((current) => [{ id: result.id ?? crypto.randomUUID(), subject: subject.trim(), category: ticketCategory, status: "Baru", createdAt: new Date().toISOString() }, ...current]);
      setSubject(""); setMessage(""); setTicketMessage("Tiket bantuan berhasil disimpan ke Supabase."); router.refresh();
    } catch (error) { setTicketErrorState(error instanceof Error ? error.message : "Tiket bantuan gagal dikirim."); }
    finally { setTicketBusy(false); }
  }

  async function updateTicket(ticket: SupportTicket, status: string) {
    setTicketBusy(true); setTicketErrorState(""); setTicketMessage("");
    try {
      const response = await fetch(`/api/support/${ticket.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Status tiket gagal diperbarui.");
      setTickets((current) => current.map((item) => item.id === ticket.id ? { ...item, status } : item));
      setTicketMessage(`Status tiket diperbarui menjadi ${status}.`); router.refresh();
    } catch (error) { setTicketErrorState(error instanceof Error ? error.message : "Status tiket gagal diperbarui."); }
    finally { setTicketBusy(false); }
  }

  return (
    <div className="help-page">
      <section className="help-hero">
        <div className="help-hero-copy"><span className="eyebrow">PUSAT BANTUAN VARENO</span><h1>Panduan yang jelas,<br /><em>alur kerja lebih lancar.</em></h1><p>Temukan cara menggunakan tiap modul, hak akses, dan koneksi database.</p><label className="help-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari panduan, misalnya harga produk..." aria-label="Cari panduan bantuan" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian">×</button>}</label></div>
        <svg className="help-hero-art" viewBox="0 0 260 190" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="133" cy="94" r="76" fill="#FCE9EC" /><circle cx="133" cy="94" r="61" stroke="#E8B8C0" strokeDasharray="3 7" /><path d="M101 45h56l20 20v73H101V45Z" fill="#FFF" stroke="#C95164" strokeWidth="2" strokeLinejoin="round" /><path d="M157 45v21h20M115 81h48M115 93h38M115 105h42" stroke="#D9A3AC" strokeWidth="3" strokeLinecap="round" /><circle cx="165" cy="127" r="25" fill="#C83E53" /><path d="m154 127 8 8 15-17" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M68 46v14m-7-7h14M202 113v12m-6-6h12" stroke="#C83E53" strokeWidth="2" strokeLinecap="round" /><path d="M53 155c19-17 32-18 47-2 13 14 27 17 41 4" stroke="#D9929D" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 6" /></svg>
      </section>
      <div className="help-categories" role="tablist" aria-label="Kategori panduan">{categories.map((item) => <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="help-results-heading"><div><span className="eyebrow">PANDUAN OPERASIONAL</span><h2>{query ? `Hasil pencarian: “${query}”` : "Pilih topik bantuan"}</h2></div><span>{filtered.length} panduan</span></div>
      {filtered.length ? <div className="help-grid">{filtered.map((article) => { const Icon = article.icon; return <article className="help-card" id={article.id} key={article.id}><div className="help-card-head"><span className="help-icon"><Icon size={19} /></span><span className="help-category-label">{article.category}</span></div><h3>{article.title}</h3><p>{article.description}</p><details><summary>Baca langkah lengkap <ArrowRight size={14} /></summary><ol>{article.content.map((step) => <li key={step}>{step}</li>)}</ol></details>{article.href && <Link href={article.href}>Buka modul <ArrowRight size={14} /></Link>}</article>; })}</div> : <div className="help-empty"><CircleHelp size={24} /><strong>Belum ada panduan yang cocok</strong><span>Coba kata kunci lain atau pilih kategori Semua.</span></div>}
      <section className="support-panel" id="support">
        <div className="support-heading"><div><span className="eyebrow">BANTUAN LANGSUNG</span><h2>Kirim tiket ke admin perusahaan</h2><p>Sertakan nama modul, langkah yang dilakukan, dan pesan error agar mudah ditindaklanjuti.</p></div><span className="support-heading-icon"><LifeBuoy size={23} /></span></div>
        <form className="support-form" onSubmit={submitTicket}>
          <label><span>Judul</span><input value={subject} onChange={(event) => setSubject(event.target.value)} minLength={4} maxLength={120} required placeholder="Contoh: Saya tidak bisa menerima pesanan" /></label>
          <label><span>Kategori</span><select value={ticketCategory} onChange={(event) => setTicketCategory(event.target.value)}><option>Akses</option><option>Data</option><option>Transaksi</option><option>Lainnya</option></select></label>
          <label className="support-message-field"><span>Jelaskan kendalanya</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={3000} required placeholder="Apa yang dilakukan, apa yang diharapkan, dan pesan error yang muncul?" /></label>
          {ticketErrorState && <div className="login-error" role="alert">{ticketErrorState}</div>}{ticketMessage && <div className="support-success" role="status">{ticketMessage}</div>}
          <button className="primary-button" type="submit" disabled={ticketBusy}><Send size={15} />{ticketBusy ? "Mengirim tiket..." : "Kirim tiket"}</button>
        </form>
        <div className="ticket-list-heading"><div><strong>Tiket bantuan</strong><span>{canManageTickets ? "Daftar tiket perusahaan" : "Tiket yang Anda kirim"}</span></div><span>{tickets.length} tiket</span></div>
        {ticketError && <div className="database-error" role="alert"><strong>Daftar tiket belum dapat dimuat.</strong><span>{ticketError}</span><Link href="/help#database">Periksa migrasi Supabase</Link></div>}
        {tickets.length ? <div className="ticket-list">{tickets.map((ticket) => <article className="ticket-row" key={ticket.id}><span className="ticket-status-mark"><LifeBuoy size={16} /></span><div className="ticket-copy"><strong>{ticket.subject}</strong><span>{ticket.category} · {ticketDate(ticket.createdAt)}{canManageTickets ? ` · ${ticket.id.slice(0, 8)}` : ""}</span></div><span className={`status-pill ${ticket.status === "Selesai" ? "status-success" : "status-pending"}`}><i />{ticket.status}</span>{canManageTickets && <div className="ticket-actions">{ticket.status === "Baru" && <button type="button" disabled={ticketBusy} onClick={() => void updateTicket(ticket, "Diproses")}>Proses</button>}{ticket.status !== "Selesai" && <button type="button" disabled={ticketBusy} onClick={() => void updateTicket(ticket, "Selesai")}>Selesaikan</button>}{ticket.status === "Selesai" && <button type="button" disabled={ticketBusy} onClick={() => void updateTicket(ticket, "Diproses")}>Buka kembali</button>}</div>}</article>)}</div> : !ticketError && <div className="ticket-empty"><CircleHelp size={17} /><span>Belum ada tiket. Kirim tiket jika memerlukan bantuan admin.</span></div>}
      </section>
    </div>
  );
}
