# VARENO ERP Dashboard

Dashboard ERP responsif untuk VARENO, dibuat dengan Next.js App Router dan Supabase. Modul mengikuti rancangan bisnis VARENO: produk dan BOM, pengadaan, persediaan, produksi, penjualan, keuangan, laporan, pengguna, dan log aktivitas.

## Menjalankan aplikasi

1. Gunakan Node.js 20.9 atau lebih baru.
2. Jalankan `npm install` lalu `npm run dev`.
3. Buka `http://localhost:3000`. Tanpa kredensial Supabase, dashboard terbuka dalam mode pratinjau dengan data contoh.

## Menghubungkan Supabase

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dari pengaturan API proyek Supabase.
3. Jalankan `supabase/migrations/202610260001_initial_schema.sql` melalui Supabase SQL Editor atau Supabase CLI.
4. Buat akun melalui Supabase Auth, lalu buat profil terkait di tabel `profiles`. Peran yang didukung: `Pemilik`, `Admin`, `Pengadaan`, `Gudang`, `Produksi`, `Penjualan`, dan `Keuangan`.
5. Setelah kredensial tersedia, login memakai autentikasi Supabase. Dashboard membaca transaksi penjualan, saldo persediaan, serta perintah produksi dari Supabase. Pengguna yang belum login diarahkan ke `/login`.

Kunci `service_role` tidak digunakan di browser. Akses tabel dibatasi dengan Row Level Security. Tabel transaksi dan mutasi stok perlu diisi melalui dokumen operasional yang terkonfirmasi; perubahan angka stok langsung tidak disediakan.

## Deployment

Aplikasi memakai Supabase SSR untuk sesi berbasis cookie dan membutuhkan runtime Next.js. Deploy ke layanan yang menjalankan Next.js (misalnya Vercel atau server Node.js), lalu isi environment variable Supabase pada environment deployment.

## Catatan implementasi

Data antarmuka pada mode pratinjau adalah data ilustrasi, bukan data bisnis VARENO yang sebenarnya. Tindakan tambah pada tabel modul saat ini memperbarui pratinjau halaman; transaksi resmi tetap harus dicatat setelah koneksi Supabase dan alur persetujuan perusahaan dikonfigurasi.
