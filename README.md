# VARENO ERP Dashboard

Dashboard ERP responsif berbasis Next.js App Router dan Supabase. Aplikasi hanya menampilkan data dari Supabase dan tidak memakai fallback pratinjau.

## Menjalankan aplikasi

1. Gunakan Node.js 20.9 atau lebih baru.
2. Salin `.env.example` menjadi `.env.local`, lalu isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Jalankan `npm install` dan `npm run dev`, lalu buka `http://localhost:3000`.
4. Login menggunakan akun Supabase Auth yang memiliki profil aktif pada `public.profiles`.

## Menyiapkan Supabase

1. Pastikan skema awal sudah diterapkan. Jika belum, jalankan `supabase/migrations/202610260001_initial_schema.sql` sekali. Setelah itu jalankan `supabase/migrations/202610260002_workflows.sql` sekali di SQL Editor; jangan menjalankan migrasi awal ulang jika tabelnya sudah ada.
2. Untuk database baru yang kosong, jalankan `supabase/seed.sql` setelah migrasi jika Anda ingin mengisi data awal ilustrasi ke database tersebut. Jangan jalankan seed pada database produksi yang berisi data perusahaan.
3. Buat akun di Supabase Authentication, lalu buat baris `public.profiles` dengan `id` yang sama dengan `auth.users.id`, nama, peran, dan `active = true`.
4. Peran yang tersedia: `Pemilik`, `Admin`, `Pengadaan`, `Gudang`, `Produksi`, `Penjualan`, dan `Keuangan`.
5. Login ke aplikasi. Jika koneksi, tabel, policy, atau fungsi database bermasalah, halaman menampilkan errornya dan tidak mengganti data dengan contoh.

`SUPABASE_SERVICE_ROLE_KEY` hanya diperlukan untuk mengirim undangan dari modul Pengguna. Simpan sebagai variabel server di `.env.local` atau environment deployment; jangan pernah menambahkan awalan `NEXT_PUBLIC_` atau mengirimnya ke browser. Tanpa key tersebut, undangan bisa dibuat dari Supabase Authentication lalu profilnya ditautkan dengan `auth.users.id`.

## Data dan alur kerja

- Produk menyimpan harga jual pada `product_variants.unit_price`; pesanan penjualan mengambil harga dari SKU tersebut.
- Siapkan BOM aktif untuk setiap produk pada halaman Produk & BOM sebelum menyimpan hasil QC. Hasil QC memotong stok bahan sesuai resep.
- Data pemasok dan bahan baku ditambahkan dari halaman Pengadaan; data pelanggan ditambahkan dari halaman Penjualan.
- Persediaan dihitung dari mutasi masuk dan keluar. Penerimaan pembelian, hasil QC, dan pemenuhan pesanan membuat mutasi terkait.
- Pengadaan, produksi, penjualan, pembayaran, biaya, dan verifikasi menggunakan fungsi transaksi di migrasi workflow agar perubahan berurutan disimpan secara atomik.
- Pusat Bantuan menyimpan tiket ke tabel `support_tickets`. Pemilik dan Admin dapat memproses atau menyelesaikan tiket.
- Row Level Security membatasi data dan tindakan berdasarkan peran. Jika aksi ditolak, UI menampilkan pesan dari aturan database.
- Laporan dan unduhan CSV diambil dari baris yang sedang dimuat dari Supabase.

## Deployment

Deploy ke layanan yang menjalankan Next.js. Atur URL dan publishable key sebagai environment variables. Jika modul Pengguna perlu mengirim undangan, atur juga `SUPABASE_SERVICE_ROLE_KEY` sebagai secret server-only.
