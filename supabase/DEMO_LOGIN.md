# Masuk demo

**Masuk demo** membuat sesi Supabase anonim dengan sekali klik. Migration membuat profil `Admin` otomatis; tidak perlu email, password, atau mengisi baris `profiles` manual. Admin demo dapat melihat dan mengubah data.

Setup satu kali di proyek Supabase:

1. Buka **Authentication → Sign In / Providers** dan aktifkan **Anonymous Sign-ins**.
2. Di **SQL Editor**, jalankan migration `202610260002_workflows.sql` jika belum pernah dijalankan, lalu jalankan `202610260003_anonymous_demo_admin.sql`.
3. Muat ulang aplikasi lalu klik **Masuk demo**.

Setiap orang yang dapat membuka aplikasi bisa masuk sebagai Admin demo. Gunakan untuk prototype dengan data demo.
