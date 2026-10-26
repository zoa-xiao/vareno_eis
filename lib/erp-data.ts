export type Metric = {
  label: string;
  value: string;
  change: string;
  direction: "up" | "down";
  note: string;
};

export type Sale = {
  id: string;
  customer: string;
  product: string;
  date: string;
  amount: string;
  status: "Selesai" | "Diproses" | "Menunggu pembayaran";
  initials: string;
  tone: string;
};

export const dashboardMetrics: Metric[] = [
  { label: "Total penjualan", value: "Rp84.650.000", change: "+12,8%", direction: "up", note: "dibanding bulan lalu" },
  { label: "Nilai persediaan", value: "Rp126.840.000", change: "+4,2%", direction: "up", note: "dari 248 SKU aktif" },
  { label: "Produksi berjalan", value: "12", change: "3 perlu QC", direction: "up", note: "perintah produksi aktif" },
  { label: "Laba kotor", value: "Rp31.280.000", change: "+8,6%", direction: "up", note: "margin 36,9% bulan ini" },
];

export const recentSales: Sale[] = [
  { id: "INV-2026-1048", customer: "Nadia Putri", product: "Kemeja Linen · 2 item", date: "26 Okt 2026", amount: "Rp1.280.000", status: "Selesai", initials: "NP", tone: "lavender" },
  { id: "INV-2026-1047", customer: "Rizky Mahendra", product: "Celana Chino · 1 item", date: "26 Okt 2026", amount: "Rp589.000", status: "Diproses", initials: "RM", tone: "peach" },
  { id: "INV-2026-1046", customer: "Aulia Rahman", product: "Sepatu Aruna · 1 item", date: "25 Okt 2026", amount: "Rp1.450.000", status: "Menunggu pembayaran", initials: "AR", tone: "mint" },
  { id: "INV-2026-1045", customer: "Dimas Pratama", product: "Kaos Essential · 3 item", date: "25 Okt 2026", amount: "Rp897.000", status: "Selesai", initials: "DP", tone: "blue" },
  { id: "INV-2026-1044", customer: "Salsa Kirana", product: "Outer Sora · 1 item", date: "24 Okt 2026", amount: "Rp765.000", status: "Selesai", initials: "SK", tone: "rose" },
];

export const salesSeries = {
  sixMonths: [36_400_000, 42_700_000, 51_300_000, 63_800_000, 75_100_000, 84_650_000],
  twelveMonths: [29_800_000, 33_200_000, 38_700_000, 36_400_000, 42_700_000, 51_300_000, 47_900_000, 54_600_000, 63_800_000, 67_400_000, 75_100_000, 84_650_000],
  labels: ["Mei", "Jun", "Jul", "Agu", "Sep", "Okt"],
};

export const inventoryAlerts = [
  { name: "Kain katun premium", code: "BB-014", stock: "8,5 meter", threshold: "12 meter", severity: "urgent" },
  { name: "Kemeja Linen · Putih / M", code: "VRN-KL-PM", stock: "4 unit", threshold: "8 unit", severity: "urgent" },
  { name: "Benang jahit hitam", code: "BB-009", stock: "14 gulung", threshold: "20 gulung", severity: "watch" },
];

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

export const moduleDefinitions: Record<string, ModuleDefinition> = {
  products: {
    title: "Produk & BOM", eyebrow: "MASTER DATA", description: "Kelola katalog produk, varian, dan kebutuhan bahan untuk setiap model.", action: "Tambah produk",
    columns: ["Produk", "SKU / Varian", "Kategori", "Harga jual", "Stok siap jual", "Status"],
    rows: [
      { Produk: "Kemeja Linen", "SKU / Varian": "VRN-KL-PM · Putih / M", Kategori: "Baju", "Harga jual": "Rp640.000", "Stok siap jual": "24 unit", Status: "Aktif" },
      { Produk: "Celana Chino", "SKU / Varian": "VRN-CC-HT · Hitam / 32", Kategori: "Celana", "Harga jual": "Rp589.000", "Stok siap jual": "18 unit", Status: "Aktif" },
      { Produk: "Sepatu Aruna", "SKU / Varian": "VRN-SA-CP · Cokelat / 42", Kategori: "Sepatu", "Harga jual": "Rp1.450.000", "Stok siap jual": "9 unit", Status: "Aktif" },
      { Produk: "Kaos Essential", "SKU / Varian": "VRN-KE-PH · Putih / L", Kategori: "Baju", "Harga jual": "Rp299.000", "Stok siap jual": "42 unit", Status: "Aktif" },
    ],
    metrics: [{ label: "Produk aktif", value: "68", note: "di 3 kategori" }, { label: "Varian / SKU", value: "248", note: "model, ukuran, warna" }, { label: "BOM aktif", value: "54", note: "siap untuk produksi" }],
  },
  purchases: {
    title: "Pengadaan", eyebrow: "OPERASIONAL", description: "Pantau permintaan pembelian, pesanan ke pemasok, dan penerimaan bahan.", action: "Buat pesanan", columns: ["No. pesanan", "Pemasok", "Tanggal", "Nilai pesanan", "Penerimaan", "Status"],
    rows: [
      { "No. pesanan": "PO-2026-0084", Pemasok: "CV Tekstil Nusantara", Tanggal: "25 Okt 2026", "Nilai pesanan": "Rp7.200.000", Penerimaan: "150 / 200 m", Status: "Menunggu persetujuan" },
      { "No. pesanan": "PO-2026-0083", Pemasok: "PT Warna Abadi", Tanggal: "23 Okt 2026", "Nilai pesanan": "Rp2.850.000", Penerimaan: "Selesai", Status: "Dipesan" },
      { "No. pesanan": "PO-2026-0082", Pemasok: "Sole Material Co.", Tanggal: "21 Okt 2026", "Nilai pesanan": "Rp5.460.000", Penerimaan: "48 / 60 pasang", Status: "Diterima sebagian" },
      { "No. pesanan": "PO-2026-0081", Pemasok: "CV Tekstil Nusantara", Tanggal: "18 Okt 2026", "Nilai pesanan": "Rp1.920.000", Penerimaan: "Selesai", Status: "Selesai" },
    ],
    metrics: [{ label: "Menunggu persetujuan", value: "3", note: "perlu tinjauan pemilik" }, { label: "Dalam pengiriman", value: "5", note: "dari 4 pemasok" }, { label: "Nilai pengadaan", value: "Rp28,4 jt", note: "bulan ini" }],
  },
  inventory: {
    title: "Persediaan", eyebrow: "OPERASIONAL", description: "Lihat posisi stok bahan baku dan produk jadi per SKU secara menyeluruh.", action: "Catat stok opname", columns: ["Item / Varian", "Kode", "Kategori", "Stok tersedia", "Batas minimum", "Kondisi"],
    rows: [
      { "Item / Varian": "Kain katun premium", Kode: "BB-014", Kategori: "Bahan baku", "Stok tersedia": "8,5 meter", "Batas minimum": "12 meter", Kondisi: "Stok rendah" },
      { "Item / Varian": "Kemeja Linen · Putih / M", Kode: "VRN-KL-PM", Kategori: "Produk jadi", "Stok tersedia": "4 unit", "Batas minimum": "8 unit", Kondisi: "Stok rendah" },
      { "Item / Varian": "Celana Chino · Hitam / 32", Kode: "VRN-CC-HT32", Kategori: "Produk jadi", "Stok tersedia": "18 unit", "Batas minimum": "10 unit", Kondisi: "Aman" },
      { "Item / Varian": "Benang jahit hitam", Kode: "BB-009", Kategori: "Bahan baku", "Stok tersedia": "14 gulung", "Batas minimum": "20 gulung", Kondisi: "Perlu pantau" },
    ],
    metrics: [{ label: "Total SKU", value: "312", note: "bahan & produk jadi" }, { label: "Di bawah minimum", value: "8", note: "butuh pengadaan" }, { label: "Akurasi stok", value: "98,4%", note: "opname terakhir" }],
  },
  production: {
    title: "Produksi", eyebrow: "OPERASIONAL", description: "Rencanakan perintah produksi, pantau kebutuhan bahan, dan catat hasil QC.", action: "Buat perintah", columns: ["No. perintah", "Produk / Varian", "Rencana", "Hasil QC", "Target selesai", "Status"],
    rows: [
      { "No. perintah": "PP-2026-0038", "Produk / Varian": "Kemeja Linen · Putih / M", Rencana: "50 unit", "Hasil QC": "45 lolos · 2 perbaikan", "Target selesai": "28 Okt 2026", Status: "Menunggu QC" },
      { "No. perintah": "PP-2026-0037", "Produk / Varian": "Celana Chino · Khaki / 32", Rencana: "36 unit", "Hasil QC": "—", "Target selesai": "30 Okt 2026", Status: "Diproses" },
      { "No. perintah": "PP-2026-0036", "Produk / Varian": "Kaos Essential · Hitam / L", Rencana: "80 unit", "Hasil QC": "78 lolos", "Target selesai": "24 Okt 2026", Status: "Selesai QC" },
      { "No. perintah": "PP-2026-0035", "Produk / Varian": "Sepatu Aruna · Cokelat / 42", Rencana: "24 pasang", "Hasil QC": "—", "Target selesai": "31 Okt 2026", Status: "Direncanakan" },
    ],
    metrics: [{ label: "Perintah aktif", value: "12", note: "di 3 kategori produk" }, { label: "Menunggu QC", value: "3", note: "perlu pemeriksaan" }, { label: "Realisasi produksi", value: "92%", note: "bulan ini" }],
  },
  sales: {
    title: "Penjualan", eyebrow: "OPERASIONAL", description: "Kelola pesanan pelanggan, ketersediaan varian, pembayaran, dan pemenuhan.", action: "Buat transaksi", columns: ["No. transaksi", "Pelanggan", "Tanggal", "Total", "Pembayaran", "Status pesanan"],
    rows: recentSales.map((sale) => ({ "No. transaksi": sale.id, Pelanggan: sale.customer, Tanggal: sale.date, Total: sale.amount, Pembayaran: sale.status === "Menunggu pembayaran" ? "Belum dibayar" : "Lunas", "Status pesanan": sale.status })),
    metrics: [{ label: "Transaksi hari ini", value: "24", note: "naik 8% dari kemarin" }, { label: "Penjualan bulan ini", value: "Rp84,6 jt", note: "target Rp100 jt" }, { label: "Pesanan diproses", value: "7", note: "3 perlu pengeluaran" }],
  },
  finance: {
    title: "Keuangan", eyebrow: "KEUANGAN", description: "Pantau arus kas, tagihan pemasok, piutang pelanggan, dan biaya operasional.", action: "Catat biaya", columns: ["Referensi", "Jenis transaksi", "Pihak terkait", "Tanggal", "Nilai", "Status"],
    rows: [
      { Referensi: "INV-2026-1046", "Jenis transaksi": "Piutang penjualan", "Pihak terkait": "Aulia Rahman", Tanggal: "25 Okt 2026", Nilai: "Rp1.450.000", Status: "Belum dibayar" },
      { Referensi: "PO-2026-0084", "Jenis transaksi": "Utang pemasok", "Pihak terkait": "CV Tekstil Nusantara", Tanggal: "25 Okt 2026", Nilai: "Rp7.200.000", Status: "Menunggu verifikasi" },
      { Referensi: "BY-2026-0192", "Jenis transaksi": "Biaya operasional", "Pihak terkait": "Operasional kantor", Tanggal: "24 Okt 2026", Nilai: "Rp2.400.000", Status: "Terverifikasi" },
      { Referensi: "INV-2026-1042", "Jenis transaksi": "Pembayaran pelanggan", "Pihak terkait": "PT Ritel Modern", Tanggal: "23 Okt 2026", Nilai: "Rp8.750.000", Status: "Terverifikasi" },
    ],
    metrics: [{ label: "Kas masuk", value: "Rp96,2 jt", note: "bulan ini" }, { label: "Kas keluar", value: "Rp64,9 jt", note: "bulan ini" }, { label: "Utang & piutang", value: "Rp18,4 jt", note: "perlu rekonsiliasi" }],
  },
  reports: {
    title: "Laporan & KPI", eyebrow: "ANALISIS", description: "Ringkasan kinerja penjualan, persediaan, produksi, dan keuangan perusahaan.", action: "Ekspor laporan", columns: ["Laporan", "Periode", "Diperbarui", "Pemilik data", "Format", "Aksi"],
    rows: [
      { Laporan: "Penjualan per kategori", Periode: "Oktober 2026", Diperbarui: "Hari ini, 09:42", "Pemilik data": "Penjualan", Format: "PDF · Excel", Aksi: "Lihat laporan" },
      { Laporan: "Posisi persediaan", Periode: "Oktober 2026", Diperbarui: "Hari ini, 09:40", "Pemilik data": "Gudang", Format: "PDF · Excel", Aksi: "Lihat laporan" },
      { Laporan: "Realisasi produksi & QC", Periode: "Oktober 2026", Diperbarui: "Kemarin, 17:12", "Pemilik data": "Produksi", Format: "PDF · Excel", Aksi: "Lihat laporan" },
      { Laporan: "Laba rugi ringkas", Periode: "Oktober 2026", Diperbarui: "Kemarin, 16:35", "Pemilik data": "Keuangan", Format: "PDF · Excel", Aksi: "Lihat laporan" },
    ],
    metrics: [{ label: "Margin laba kotor", value: "36,9%", note: "target 35%" }, { label: "Kelulusan QC", value: "93,8%", note: "bulan ini" }, { label: "Pemenuhan pesanan", value: "96,2%", note: "bulan ini" }],
  },
  users: {
    title: "Pengguna & Hak Akses", eyebrow: "PENGATURAN", description: "Atur akses tim berdasarkan peran dan tanggung jawab di VARENO.", action: "Undang pengguna", columns: ["Nama pengguna", "Email", "Peran", "Aktivitas terakhir", "Status"],
    rows: [
      { "Nama pengguna": "Aditya Pramana", Email: "aditya@vareno.id", Peran: "Pemilik", "Aktivitas terakhir": "Hari ini, 09:42", Status: "Aktif" },
      { "Nama pengguna": "Maya Salsabila", Email: "maya@vareno.id", Peran: "Pengadaan", "Aktivitas terakhir": "Hari ini, 09:31", Status: "Aktif" },
      { "Nama pengguna": "Rafi Nugraha", Email: "rafi@vareno.id", Peran: "Gudang", "Aktivitas terakhir": "Hari ini, 09:18", Status: "Aktif" },
      { "Nama pengguna": "Nina Puspita", Email: "nina@vareno.id", Peran: "Keuangan", "Aktivitas terakhir": "Kemarin, 16:54", Status: "Aktif" },
    ],
    metrics: [{ label: "Pengguna aktif", value: "18", note: "dari 21 akun" }, { label: "Peran tersedia", value: "7", note: "sesuai struktur tim" }, { label: "Akun nonaktif", value: "3", note: "tidak dapat masuk" }],
  },
  activity: {
    title: "Log Aktivitas", eyebrow: "PENGATURAN", description: "Jejak perubahan penting membantu menjaga akuntabilitas transaksi dan stok.", action: "Unduh log", columns: ["Pengguna", "Aktivitas", "Modul", "Dokumen", "Waktu"],
    rows: [
      { Pengguna: "Maya Salsabila", Aktivitas: "Mengajukan pesanan pembelian", Modul: "Pengadaan", Dokumen: "PO-2026-0084", Waktu: "Hari ini, 09:42" },
      { Pengguna: "Rafi Nugraha", Aktivitas: "Mengonfirmasi penerimaan bahan", Modul: "Persediaan", Dokumen: "RCV-2026-0071", Waktu: "Hari ini, 09:18" },
      { Pengguna: "Nina Puspita", Aktivitas: "Memverifikasi pembayaran pelanggan", Modul: "Keuangan", Dokumen: "PAY-2026-0114", Waktu: "Hari ini, 08:56" },
      { Pengguna: "Aditya Pramana", Aktivitas: "Menyetujui rencana produksi", Modul: "Produksi", Dokumen: "PP-2026-0038", Waktu: "Kemarin, 16:32" },
    ],
    metrics: [{ label: "Aktivitas hari ini", value: "46", note: "dari 12 pengguna" }, { label: "Dokumen dikonfirmasi", value: "18", note: "hari ini" }, { label: "Perlu ditinjau", value: "2", note: "perubahan stok" }],
  },
};
