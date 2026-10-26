-- Seed records for a newly connected VARENO ERP project.
-- Document/source IDs use DEMO; master data is identifiable by VARENO-* SKUs and MAT-* material codes.
-- Run the initial schema migration before this file.

begin;

insert into public.product_categories (name)
values ('Baju'), ('Celana'), ('Sepatu')
on conflict (name) do nothing;

insert into public.products (id, name, category_id, model, active) values
  ('11111111-1111-4111-8111-111111111101', 'Kemeja Linen Sora', (select id from public.product_categories where name = 'Baju'), 'VRS-KLS-01', true),
  ('11111111-1111-4111-8111-111111111102', 'Kaos Katun Nusa', (select id from public.product_categories where name = 'Baju'), 'VRS-KKN-01', true),
  ('11111111-1111-4111-8111-111111111103', 'Celana Chino Aruna', (select id from public.product_categories where name = 'Celana'), 'VRS-CCA-01', true),
  ('11111111-1111-4111-8111-111111111104', 'Sneakers Urban Aksa', (select id from public.product_categories where name = 'Sepatu'), 'VRS-SUA-01', true)
on conflict (id) do update set name = excluded.name, category_id = excluded.category_id, model = excluded.model, active = excluded.active;

insert into public.product_variants (sku, product_id, variant_name, size, color, unit_price, unit_cost, minimum_stock) values
  ('VARENO-KML-WHT-M', '11111111-1111-4111-8111-111111111101', 'Putih / M', 'M', 'Putih', 399000, 150000, 125),
  ('VARENO-KKN-BLK-M', '11111111-1111-4111-8111-111111111102', 'Hitam / M', 'M', 'Hitam', 219000, 50000, 35),
  ('VARENO-CCA-KHK-32', '11111111-1111-4111-8111-111111111103', 'Khaki / 32', '32', 'Khaki', 429000, 240000, 20),
  ('VARENO-SUA-WHT-40', '11111111-1111-4111-8111-111111111104', 'Putih / 40', '40', 'Putih', 589000, 286800, 15)
on conflict (sku) do update set product_id = excluded.product_id, variant_name = excluded.variant_name, size = excluded.size,
  color = excluded.color, unit_price = excluded.unit_price, unit_cost = excluded.unit_cost, minimum_stock = excluded.minimum_stock;

insert into public.raw_materials (code, name, material_type, unit, unit_cost, minimum_stock) values
  ('MAT-KTN-01', 'Kain katun premium', 'Kain', 'meter', 180000, 125),
  ('MAT-LIN-01', 'Kain linen natural', 'Kain', 'meter', 240000, 90),
  ('MAT-ZIP-01', 'Resleting No. 5', 'Aksesori', 'pcs', 4500, 2500),
  ('MAT-BTN-01', 'Kancing tanduk premium', 'Aksesori', 'pcs', 1000, 5000),
  ('MAT-THR-01', 'Benang poliester', 'Benang', 'gulungan', 10000, 180),
  ('MAT-BOX-01', 'Kotak kemasan VARENO', 'Kemasan', 'pcs', 2500, 500)
on conflict (code) do update set name = excluded.name, material_type = excluded.material_type, unit = excluded.unit,
  unit_cost = excluded.unit_cost, minimum_stock = excluded.minimum_stock;

insert into public.suppliers (id, name, address, active) values
  ('22222222-2222-4222-8222-222222222201', 'CV Sumber Tekstil Makmur', 'Bandung, Jawa Barat', true),
  ('22222222-2222-4222-8222-222222222202', 'PT Benang Nusantara', 'Jakarta, Indonesia', true),
  ('22222222-2222-4222-8222-222222222203', 'CV Karya Kemasan', 'Surabaya, Jawa Timur', true)
on conflict (id) do update set name = excluded.name, address = excluded.address, active = excluded.active;

insert into public.customers (id, name, address) values
  ('33333333-3333-4333-8333-333333333301', 'Nadia Putri', 'Jakarta, Indonesia'),
  ('33333333-3333-4333-8333-333333333302', 'Rizky Mahendra', 'Bandung, Indonesia'),
  ('33333333-3333-4333-8333-333333333303', 'Aulia Rahman', 'Surabaya, Indonesia'),
  ('33333333-3333-4333-8333-333333333304', 'Dimas Pratama', 'Yogyakarta, Indonesia'),
  ('33333333-3333-4333-8333-333333333305', 'Maya Saraswati', 'Denpasar, Indonesia'),
  ('33333333-3333-4333-8333-333333333306', 'Fajar Wibowo', 'Semarang, Indonesia')
on conflict (id) do update set name = excluded.name, address = excluded.address;

insert into public.bills_of_materials (id, product_id, version, active) values
  ('44444444-4444-4444-8444-444444444401', '11111111-1111-4111-8111-111111111101', 1, true),
  ('44444444-4444-4444-8444-444444444402', '11111111-1111-4111-8111-111111111102', 1, true),
  ('44444444-4444-4444-8444-444444444403', '11111111-1111-4111-8111-111111111103', 1, true),
  ('44444444-4444-4444-8444-444444444404', '11111111-1111-4111-8111-111111111104', 1, true)
on conflict (id) do update set product_id = excluded.product_id, version = excluded.version, active = excluded.active;

insert into public.bom_items (id, bom_id, material_code, quantity_per_unit) values
  ('45454545-4545-4545-8454-454545454501', '44444444-4444-4444-8444-444444444401', 'MAT-LIN-01', 1.4),
  ('45454545-4545-4545-8454-454545454502', '44444444-4444-4444-8444-444444444401', 'MAT-BTN-01', 8),
  ('45454545-4545-4545-8454-454545454503', '44444444-4444-4444-8444-444444444401', 'MAT-THR-01', 0.3),
  ('45454545-4545-4545-8454-454545454504', '44444444-4444-4444-8444-444444444401', 'MAT-BOX-01', 1),
  ('45454545-4545-4545-8454-454545454505', '44444444-4444-4444-8444-444444444402', 'MAT-KTN-01', 0.8),
  ('45454545-4545-4545-8454-454545454506', '44444444-4444-4444-8444-444444444402', 'MAT-THR-01', 0.25),
  ('45454545-4545-4545-8454-454545454507', '44444444-4444-4444-8444-444444444402', 'MAT-BOX-01', 1),
  ('45454545-4545-4545-8454-454545454508', '44444444-4444-4444-8444-444444444403', 'MAT-KTN-01', 0.9),
  ('45454545-4545-4545-8454-454545454509', '44444444-4444-4444-8444-444444444403', 'MAT-ZIP-01', 1),
  ('45454545-4545-4545-8454-454545454510', '44444444-4444-4444-8444-444444444403', 'MAT-BTN-01', 1),
  ('45454545-4545-4545-8454-454545454511', '44444444-4444-4444-8444-444444444403', 'MAT-BOX-01', 1),
  ('45454545-4545-4545-8454-454545454512', '44444444-4444-4444-8444-444444444404', 'MAT-KTN-01', 0.2),
  ('45454545-4545-4545-8454-454545454513', '44444444-4444-4444-8444-444444444404', 'MAT-THR-01', 0.1),
  ('45454545-4545-4545-8454-454545454514', '44444444-4444-4444-8444-444444444404', 'MAT-BOX-01', 1)
on conflict (bom_id, material_code) do update set quantity_per_unit = excluded.quantity_per_unit;

insert into public.purchase_orders (id, supplier_id, supplier_name, order_date, total, status) values
  ('DEMO-PO-2026-001', '22222222-2222-4222-8222-222222222201', 'CV Sumber Tekstil Makmur', current_date - 1, 15800000, 'Menunggu Persetujuan'),
  ('DEMO-PO-2026-002', '22222222-2222-4222-8222-222222222202', 'PT Benang Nusantara', current_date - 2, 8450000, 'Menunggu Persetujuan'),
  ('DEMO-PO-2026-003', '22222222-2222-4222-8222-222222222203', 'CV Karya Kemasan', current_date - 3, 12600000, 'Menunggu Persetujuan')
on conflict (id) do update set supplier_id = excluded.supplier_id, supplier_name = excluded.supplier_name,
  order_date = excluded.order_date, total = excluded.total, status = excluded.status;

insert into public.purchase_order_items (id, purchase_order_id, material_code, quantity, unit_price, received_quantity) values
  ('66666666-6666-4666-8666-666666666601', 'DEMO-PO-2026-001', 'MAT-LIN-01', 40, 240000, 0),
  ('66666666-6666-4666-8666-666666666602', 'DEMO-PO-2026-001', 'MAT-KTN-01', 30, 180000, 0),
  ('66666666-6666-4666-8666-666666666603', 'DEMO-PO-2026-002', 'MAT-THR-01', 500, 10000, 0),
  ('66666666-6666-4666-8666-666666666604', 'DEMO-PO-2026-003', 'MAT-BOX-01', 3000, 4200, 0)
on conflict (id) do update set purchase_order_id = excluded.purchase_order_id, material_code = excluded.material_code,
  quantity = excluded.quantity, unit_price = excluded.unit_price, received_quantity = excluded.received_quantity;

insert into public.production_orders (id, sku, variant_name, planned_quantity, result_quantity, status, target_date) values
  ('DEMO-PRD-2026-001', 'VARENO-KML-WHT-M', 'Putih / M', 48, 0, 'Diproses', current_date + 2),
  ('DEMO-PRD-2026-002', 'VARENO-KKN-BLK-M', 'Hitam / M', 72, 0, 'Diproses', current_date + 3),
  ('DEMO-PRD-2026-003', 'VARENO-CCA-KHK-32', 'Khaki / 32', 36, 0, 'Direncanakan', current_date + 5),
  ('DEMO-PRD-2026-004', 'VARENO-SUA-WHT-40', 'Putih / 40', 24, 0, 'Diproses', current_date + 4),
  ('DEMO-PRD-2026-005', 'VARENO-KML-WHT-M', 'Putih / M', 40, 0, 'Menunggu QC', current_date + 1),
  ('DEMO-PRD-2026-006', 'VARENO-KKN-BLK-M', 'Hitam / M', 60, 0, 'Diproses', current_date + 3),
  ('DEMO-PRD-2026-007', 'VARENO-CCA-KHK-32', 'Khaki / 32', 32, 0, 'Direncanakan', current_date + 6),
  ('DEMO-PRD-2026-008', 'VARENO-SUA-WHT-40', 'Putih / 40', 20, 0, 'Diproses', current_date + 2),
  ('DEMO-PRD-2026-009', 'VARENO-KML-WHT-M', 'Putih / M', 36, 0, 'Menunggu QC', current_date + 1),
  ('DEMO-PRD-2026-010', 'VARENO-KKN-BLK-M', 'Hitam / M', 54, 0, 'Diproses', current_date + 4),
  ('DEMO-PRD-2026-011', 'VARENO-CCA-KHK-32', 'Khaki / 32', 28, 0, 'Menunggu QC', current_date + 1),
  ('DEMO-PRD-2026-012', 'VARENO-SUA-WHT-40', 'Putih / 40', 18, 0, 'Direncanakan', current_date + 7),
  ('DEMO-PRD-2026-090', 'VARENO-KML-WHT-M', 'Putih / M', 40, 39, 'Selesai', current_date - 2)
on conflict (id) do update set sku = excluded.sku, variant_name = excluded.variant_name,
  planned_quantity = excluded.planned_quantity, result_quantity = excluded.result_quantity,
  status = excluded.status, target_date = excluded.target_date;

insert into public.quality_checks (id, production_order_id, inspected_quantity, passed_quantity, rework_quantity, failed_quantity) values
  ('77777777-7777-4777-8777-777777777701', 'DEMO-PRD-2026-090', 40, 39, 1, 0)
on conflict (id) do update set production_order_id = excluded.production_order_id,
  inspected_quantity = excluded.inspected_quantity, passed_quantity = excluded.passed_quantity,
  rework_quantity = excluded.rework_quantity, failed_quantity = excluded.failed_quantity;

insert into public.sales (id, customer_id, customer_name, total, discount, status, payment_status, created_at) values
  ('DEMO-INV-2026-1048', '33333333-3333-4333-8333-333333333301', 'Nadia Putri', 1280000, 0, 'Selesai', 'Lunas', now() - interval '1 hour'),
  ('DEMO-INV-2026-1047', '33333333-3333-4333-8333-333333333302', 'Rizky Mahendra', 589000, 0, 'Menunggu Pengeluaran Barang', 'Lunas', now() - interval '7 hours'),
  ('DEMO-INV-2026-1046', '33333333-3333-4333-8333-333333333303', 'Aulia Rahman', 1450000, 0, 'Menunggu pembayaran', 'Belum Dibayar', now() - interval '1 day'),
  ('DEMO-INV-2026-1045', '33333333-3333-4333-8333-333333333304', 'Dimas Pratama', 897000, 0, 'Selesai', 'Lunas', now() - interval '2 days'),
  ('DEMO-INV-2026-1044', '33333333-3333-4333-8333-333333333305', 'Maya Saraswati', 12480000, 0, 'Selesai', 'Lunas', now() - interval '4 days'),
  ('DEMO-INV-2026-1043', '33333333-3333-4333-8333-333333333306', 'Fajar Wibowo', 7520000, 0, 'Selesai', 'Lunas', now() - interval '6 days'),
  ('DEMO-INV-2026-1042', '33333333-3333-4333-8333-333333333301', 'Nadia Putri', 9640000, 0, 'Menunggu Pengeluaran Barang', 'Lunas', now() - interval '8 days'),
  ('DEMO-INV-2026-1041', '33333333-3333-4333-8333-333333333302', 'Rizky Mahendra', 8375000, 0, 'Selesai', 'Lunas', now() - interval '10 days'),
  ('DEMO-INV-2026-1040', '33333333-3333-4333-8333-333333333303', 'Aulia Rahman', 11325000, 0, 'Selesai', 'Lunas', now() - interval '13 days'),
  ('DEMO-INV-2026-1039', '33333333-3333-4333-8333-333333333304', 'Dimas Pratama', 6875000, 0, 'Menunggu Pengeluaran Barang', 'Sebagian', now() - interval '16 days'),
  ('DEMO-INV-2026-1038', '33333333-3333-4333-8333-333333333305', 'Maya Saraswati', 10950000, 0, 'Selesai', 'Lunas', now() - interval '19 days'),
  ('DEMO-INV-2026-1037', '33333333-3333-4333-8333-333333333306', 'Fajar Wibowo', 13269000, 0, 'Selesai', 'Lunas', now() - interval '23 days')
on conflict (id) do update set customer_id = excluded.customer_id, customer_name = excluded.customer_name,
  total = excluded.total, discount = excluded.discount, status = excluded.status,
  payment_status = excluded.payment_status, created_at = excluded.created_at;

-- These opening-balance records total Rp126.840.000.
insert into public.stock_movements (id, item_type, item_code, item_name, movement_type, quantity, unit_cost, minimum_stock, source_type, source_id, reason, created_at) values
  ('55555555-5555-4555-8555-555555555501', 'bahan_baku', 'MAT-KTN-01', 'Kain katun premium', 'MASUK', 120, 180000, 125, 'Saldo Awal', 'DEMO-OPENING-2026', 'Data awal ilustrasi', now()),
  ('55555555-5555-4555-8555-555555555502', 'bahan_baku', 'MAT-LIN-01', 'Kain linen natural', 'MASUK', 85, 240000, 90, 'Saldo Awal', 'DEMO-OPENING-2026', 'Data awal ilustrasi', now()),
  ('55555555-5555-4555-8555-555555555503', 'bahan_baku', 'MAT-ZIP-01', 'Resleting No. 5', 'MASUK', 2000, 4500, 2500, 'Saldo Awal', 'DEMO-OPENING-2026', 'Data awal ilustrasi', now()),
  ('55555555-5555-4555-8555-555555555504', 'bahan_baku', 'MAT-BTN-01', 'Kancing tanduk premium', 'MASUK', 5000, 1000, 5000, 'Saldo Awal', 'DEMO-OPENING-2026', 'Data awal ilustrasi', now()),
  ('55555555-5555-4555-8555-555555555505', 'bahan_baku', 'MAT-THR-01', 'Benang poliester', 'MASUK', 300, 10000, 180, 'Saldo Awal', 'DEMO-OPENING-2026', 'Data awal ilustrasi', now()),
  ('55555555-5555-4555-8555-555555555506', 'bahan_baku', 'MAT-BOX-01', 'Kotak kemasan VARENO', 'MASUK', 1000, 2500, 500, 'Saldo Awal', 'DEMO-OPENING-2026', 'Data awal ilustrasi', now()),
  ('55555555-5555-4555-8555-555555555507', 'produk_jadi', 'VARENO-KML-WHT-M', 'Kemeja Linen Sora · Putih / M', 'MASUK', 120, 150000, 125, 'Saldo Awal', 'DEMO-OPENING-2026', 'Data awal ilustrasi', now()),
  ('55555555-5555-4555-8555-555555555508', 'produk_jadi', 'VARENO-KKN-BLK-M', 'Kaos Katun Nusa · Hitam / M', 'MASUK', 180, 50000, 35, 'Saldo Awal', 'DEMO-OPENING-2026', 'Data awal ilustrasi', now()),
  ('55555555-5555-4555-8555-555555555509', 'produk_jadi', 'VARENO-CCA-KHK-32', 'Celana Chino Aruna · Khaki / 32', 'MASUK', 100, 240000, 20, 'Saldo Awal', 'DEMO-OPENING-2026', 'Data awal ilustrasi', now()),
  ('55555555-5555-4555-8555-555555555510', 'produk_jadi', 'VARENO-SUA-WHT-40', 'Sneakers Urban Aksa · Putih / 40', 'MASUK', 50, 286800, 15, 'Saldo Awal', 'DEMO-OPENING-2026', 'Data awal ilustrasi', now())
on conflict (id) do update set item_type = excluded.item_type, item_code = excluded.item_code,
  item_name = excluded.item_name, movement_type = excluded.movement_type, quantity = excluded.quantity,
  unit_cost = excluded.unit_cost, minimum_stock = excluded.minimum_stock, source_type = excluded.source_type,
  source_id = excluded.source_id, reason = excluded.reason, created_at = excluded.created_at;

insert into public.operating_expenses (id, expense_type, amount, description, transaction_date) values
  ('DEMO-EXP-2026-001', 'Operasional', 4500000, 'Biaya operasional studio', current_date - 3),
  ('DEMO-EXP-2026-002', 'Utilitas', 1250000, 'Listrik dan internet', current_date - 5),
  ('DEMO-EXP-2026-003', 'Pemasaran', 2850000, 'Produksi materi katalog', current_date - 8),
  ('DEMO-EXP-2026-004', 'Pengiriman', 975000, 'Pengiriman pesanan pelanggan', current_date - 9)
on conflict (id) do update set expense_type = excluded.expense_type, amount = excluded.amount,
  description = excluded.description, transaction_date = excluded.transaction_date;

insert into public.financial_transactions (id, direction, amount, source_type, source_id, status, transaction_date) values
  ('DEMO-FIN-2026-001', 'MASUK', 1280000, 'Penjualan', 'DEMO-INV-2026-1048', 'Terverifikasi', current_date),
  ('DEMO-FIN-2026-002', 'MASUK', 1450000, 'Penjualan', 'DEMO-INV-2026-1046', 'Menunggu Verifikasi', current_date - 1),
  ('DEMO-FIN-2026-003', 'KELUAR', 4500000, 'Biaya', 'DEMO-EXP-2026-001', 'Terverifikasi', current_date - 3),
  ('DEMO-FIN-2026-004', 'KELUAR', 1250000, 'Biaya', 'DEMO-EXP-2026-002', 'Menunggu Verifikasi', current_date - 5)
on conflict (id) do update set direction = excluded.direction, amount = excluded.amount,
  source_type = excluded.source_type, source_id = excluded.source_id, status = excluded.status,
  transaction_date = excluded.transaction_date;

commit;
