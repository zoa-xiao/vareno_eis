export type ModuleRecord = Record<string, string>;
export type ModuleDefinition = {
  title: string;
  eyebrow: string;
  description: string;
  action: string;
  columns: string[];
  rows: ModuleRecord[];
  metrics: { label: string; value: string; note: string }[];
};

const metrics = (labels: [string, string, string]) => labels.map((label) => ({ label, value: "—", note: "Memuat data Supabase" }));
const emptyRows: ModuleRecord[] = [];

export const moduleDefinitions: Record<string, ModuleDefinition> = {
  products: {
    title: "Produk & BOM", eyebrow: "MASTER DATA", description: "Kelola katalog produk, varian, dan kebutuhan bahan untuk setiap model.", action: "Tambah produk",
    columns: ["Produk", "SKU / Varian", "Kategori", "Harga jual", "Stok siap jual", "Status"], rows: emptyRows,
    metrics: metrics(["Produk aktif", "Varian / SKU", "BOM aktif"]),
  },
  purchases: {
    title: "Pengadaan", eyebrow: "OPERASIONAL", description: "Buat pesanan pembelian, pantau persetujuan, dan catat penerimaan bahan.", action: "Buat pesanan", columns: ["No. pesanan", "Pemasok", "Tanggal", "Nilai pesanan", "Penerimaan", "Status"], rows: emptyRows,
    metrics: metrics(["Menunggu persetujuan", "Dalam pengiriman", "Nilai pengadaan"]),
  },
  inventory: {
    title: "Persediaan", eyebrow: "OPERASIONAL", description: "Pantau saldo aktual dan catat mutasi bahan baku serta produk jadi.", action: "Catat mutasi", columns: ["Item / Varian", "Kode", "Kategori", "Stok tersedia", "Batas minimum", "Kondisi"], rows: emptyRows,
    metrics: metrics(["Total SKU", "Di bawah minimum", "Nilai persediaan"]),
  },
  production: {
    title: "Produksi", eyebrow: "OPERASIONAL", description: "Buat perintah produksi, pantau target, dan catat hasil pemeriksaan QC.", action: "Buat perintah", columns: ["No. perintah", "Produk / Varian", "Rencana", "Hasil QC", "Target selesai", "Status"], rows: emptyRows,
    metrics: metrics(["Perintah aktif", "Menunggu QC", "Selesai QC"]),
  },
  sales: {
    title: "Penjualan", eyebrow: "OPERASIONAL", description: "Buat transaksi, penuhi pesanan, dan rekam pembayaran pelanggan.", action: "Buat transaksi", columns: ["No. transaksi", "Pelanggan", "Tanggal", "Total", "Pembayaran", "Status pesanan"], rows: emptyRows,
    metrics: metrics(["Total transaksi", "Penjualan tercatat", "Pesanan berjalan"]),
  },
  finance: {
    title: "Keuangan", eyebrow: "KEUANGAN", description: "Catat biaya, tinjau transaksi, dan pantau arus kas yang terverifikasi.", action: "Catat biaya", columns: ["Referensi", "Jenis transaksi", "Pihak terkait", "Tanggal", "Nilai", "Status"], rows: emptyRows,
    metrics: metrics(["Kas masuk", "Kas keluar", "Menunggu verifikasi"]),
  },
  reports: {
    title: "Laporan & KPI", eyebrow: "ANALISIS", description: "Ringkasan kinerja penjualan, persediaan, produksi, dan keuangan perusahaan.", action: "Ekspor CSV", columns: ["Laporan", "Periode", "Diperbarui", "Pemilik data", "Nilai", "Status"], rows: emptyRows,
    metrics: metrics(["Penjualan tercatat", "Realisasi produksi", "Arus kas bersih"]),
  },
  users: {
    title: "Pengguna & Hak Akses", eyebrow: "PENGATURAN", description: "Kelola profil aktif dan peran setiap anggota tim.", action: "Undang pengguna", columns: ["Nama pengguna", "Email", "Peran", "Aktivitas terakhir", "Status"], rows: emptyRows,
    metrics: metrics(["Pengguna terdaftar", "Peran tersedia", "Akun nonaktif"]),
  },
  activity: {
    title: "Log Aktivitas", eyebrow: "PENGATURAN", description: "Telusuri jejak perubahan operasional yang tercatat di database.", action: "Ekspor CSV", columns: ["Pengguna", "Aktivitas", "Modul", "Dokumen", "Waktu"], rows: emptyRows,
    metrics: metrics(["Aktivitas tercatat", "Modul", "Pembaruan terakhir"]),
  },
};
