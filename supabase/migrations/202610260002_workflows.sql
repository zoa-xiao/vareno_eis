-- Transaction-safe operations used by the VARENO web application.
-- Apply after 202610260001_initial_schema.sql.

alter table public.profiles add column if not exists email text;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id),
  category text not null check (category in ('Akses', 'Data', 'Transaksi', 'Lainnya')),
  subject text not null check (length(trim(subject)) between 4 and 120),
  message text not null check (length(trim(message)) between 10 and 3000),
  status text not null default 'Baru' check (status in ('Baru', 'Diproses', 'Selesai')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.support_tickets enable row level security;
create policy "users read own support tickets" on public.support_tickets for select to authenticated
  using (requester_id = auth.uid() or public.has_role(array['Pemilik', 'Admin']));
create policy "users create own support tickets" on public.support_tickets for insert to authenticated
  with check (requester_id = auth.uid() and status = 'Baru');
create policy "admins manage support ticket status" on public.support_tickets for update to authenticated
  using (public.has_role(array['Pemilik', 'Admin'])) with check (public.has_role(array['Pemilik', 'Admin']));
grant select, insert, update on public.support_tickets to authenticated;

drop policy if exists "procurement manages suppliers" on public.suppliers;
create policy "procurement and owner manage suppliers" on public.suppliers for all to authenticated
  using (public.has_role(array['Pengadaan', 'Pemilik'])) with check (public.has_role(array['Pengadaan', 'Pemilik']));
drop policy if exists "sales manages customers" on public.customers;
create policy "sales and owner manage customers" on public.customers for all to authenticated
  using (public.has_role(array['Penjualan', 'Pemilik'])) with check (public.has_role(array['Penjualan', 'Pemilik']));
drop policy if exists "warehouse records stock movements" on public.stock_movements;
create policy "warehouse and owner record stock movements" on public.stock_movements for insert to authenticated
  with check (public.has_role(array['Gudang', 'Pemilik']) and created_by = auth.uid());

create or replace function public.create_support_ticket(p_subject text, p_category text, p_message text)
returns uuid language plpgsql security definer set search_path = public as $$
declare ticket_id uuid;
begin
  if public.current_user_role() is null then raise exception 'Profil pengguna aktif diperlukan untuk mengirim tiket'; end if;
  if p_category not in ('Akses', 'Data', 'Transaksi', 'Lainnya') then raise exception 'Kategori tiket tidak valid'; end if;
  if length(trim(coalesce(p_subject, ''))) not between 4 and 120 then raise exception 'Judul harus terdiri dari 4 sampai 120 karakter'; end if;
  if length(trim(coalesce(p_message, ''))) not between 10 and 3000 then raise exception 'Pesan harus terdiri dari 10 sampai 3000 karakter'; end if;
  insert into public.support_tickets(requester_id, category, subject, message) values (auth.uid(), p_category, trim(p_subject), trim(p_message)) returning id into ticket_id;
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Pusat Bantuan', 'Mengirim tiket bantuan', ticket_id::text, jsonb_build_object('category', p_category, 'subject', p_subject));
  return ticket_id;
end; $$;

create or replace function public.update_support_ticket(p_ticket_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare old_status text;
begin
  if not public.has_role(array['Pemilik', 'Admin']) then raise exception 'Hanya Pemilik atau Admin yang dapat memperbarui tiket bantuan'; end if;
  if p_status not in ('Baru', 'Diproses', 'Selesai') then raise exception 'Status tiket tidak valid'; end if;
  select status into old_status from public.support_tickets where id = p_ticket_id for update;
  if not found then raise exception 'Tiket bantuan tidak ditemukan'; end if;
  update public.support_tickets set status = p_status, updated_at = now() where id = p_ticket_id;
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Pusat Bantuan', 'Memperbarui status tiket', p_ticket_id::text, jsonb_build_object('old_status', old_status, 'new_status', p_status));
end; $$;

create or replace function public.create_supplier(p_name text, p_contact text, p_address text)
returns uuid language plpgsql security definer set search_path = public as $$
declare supplier_id uuid;
begin
  if not public.has_role(array['Pengadaan', 'Pemilik']) then raise exception 'Akses ditolak untuk mengelola pemasok'; end if;
  if trim(coalesce(p_name, '')) = '' then raise exception 'Nama pemasok wajib diisi'; end if;
  insert into public.suppliers(name, contact, address) values (trim(p_name), nullif(trim(coalesce(p_contact, '')), ''), nullif(trim(coalesce(p_address, '')), '')) returning id into supplier_id;
  insert into public.audit_logs(user_id, module, action, document_id, new_value) values (auth.uid(), 'Pengadaan', 'Menambahkan pemasok', supplier_id::text, jsonb_build_object('name', p_name));
  return supplier_id;
end; $$;

create or replace function public.create_raw_material(p_code text, p_name text, p_material_type text, p_unit text, p_unit_cost numeric, p_minimum_stock numeric)
returns text language plpgsql security definer set search_path = public as $$
declare material_code text := upper(trim(coalesce(p_code, '')));
begin
  if not public.has_role(array['Pengadaan', 'Pemilik']) then raise exception 'Akses ditolak untuk mengelola bahan baku'; end if;
  if material_code = '' or trim(coalesce(p_name, '')) = '' or trim(coalesce(p_material_type, '')) = '' or trim(coalesce(p_unit, '')) = '' then raise exception 'Kode, nama, jenis, dan satuan bahan wajib diisi'; end if;
  if p_unit_cost < 0 or p_minimum_stock < 0 then raise exception 'HPP dan stok minimum tidak boleh negatif'; end if;
  insert into public.raw_materials(code, name, material_type, unit, unit_cost, minimum_stock)
    values (material_code, trim(p_name), trim(p_material_type), trim(p_unit), p_unit_cost, p_minimum_stock);
  insert into public.audit_logs(user_id, module, action, document_id, new_value) values (auth.uid(), 'Pengadaan', 'Menambahkan bahan baku', material_code, jsonb_build_object('name', p_name, 'unit', p_unit));
  return material_code;
end; $$;

create or replace function public.create_customer(p_name text, p_contact text, p_address text)
returns uuid language plpgsql security definer set search_path = public as $$
declare customer_id uuid;
begin
  if not public.has_role(array['Penjualan', 'Pemilik']) then raise exception 'Akses ditolak untuk mengelola pelanggan'; end if;
  if trim(coalesce(p_name, '')) = '' then raise exception 'Nama pelanggan wajib diisi'; end if;
  insert into public.customers(name, contact, address) values (trim(p_name), nullif(trim(coalesce(p_contact, '')), ''), nullif(trim(coalesce(p_address, '')), '')) returning id into customer_id;
  insert into public.audit_logs(user_id, module, action, document_id, new_value) values (auth.uid(), 'Penjualan', 'Menambahkan pelanggan', customer_id::text, jsonb_build_object('name', p_name));
  return customer_id;
end; $$;

create or replace function public.add_bom_material(p_product_id uuid, p_material_code text, p_quantity_per_unit numeric)
returns uuid language plpgsql security definer set search_path = public as $$
declare product_record public.products; bom_id uuid; bom_item_id uuid; next_version integer;
begin
  if not public.has_role(array['Produksi', 'Pemilik']) then raise exception 'Akses ditolak untuk mengelola BOM'; end if;
  if p_quantity_per_unit <= 0 then raise exception 'Kebutuhan bahan per produk harus lebih dari nol'; end if;
  select * into product_record from public.products where id = p_product_id and active = true for update;
  if not found then raise exception 'Produk aktif tidak ditemukan'; end if;
  if not exists (select 1 from public.raw_materials where code = p_material_code and active = true) then raise exception 'Bahan baku aktif tidak ditemukan'; end if;
  select id into bom_id from public.bills_of_materials where product_id = p_product_id and active = true for update;
  if bom_id is null then
    select coalesce(max(version), 0) + 1 into next_version from public.bills_of_materials where product_id = p_product_id;
    insert into public.bills_of_materials(product_id, version, active) values (p_product_id, next_version, true) returning id into bom_id;
  end if;
  insert into public.bom_items(bom_id, material_code, quantity_per_unit) values (bom_id, p_material_code, p_quantity_per_unit)
    on conflict (bom_id, material_code) do update set quantity_per_unit = excluded.quantity_per_unit returning id into bom_item_id;
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Produksi', 'Menambahkan atau memperbarui komposisi BOM', bom_id::text, jsonb_build_object('product', product_record.name, 'material', p_material_code, 'quantity_per_unit', p_quantity_per_unit));
  return bom_item_id;
end; $$;

create or replace function public.create_product_variant(
  p_name text, p_model text, p_category text, p_sku text, p_variant_name text,
  p_size text, p_color text, p_unit_price numeric, p_unit_cost numeric, p_minimum_stock numeric
) returns text language plpgsql security definer set search_path = public as $$
declare category_id uuid; product_id uuid;
begin
  if not public.has_role(array['Produksi', 'Pemilik']) then raise exception 'Akses ditolak untuk mengelola produk'; end if;
  if trim(p_name) = '' or trim(p_model) = '' or trim(p_category) = '' or trim(p_sku) = '' then raise exception 'Nama, model, kategori, dan SKU wajib diisi'; end if;
  if p_unit_price < 0 or p_unit_cost < 0 or p_minimum_stock < 0 then raise exception 'Harga dan stok minimum tidak boleh negatif'; end if;
  insert into public.product_categories(name) values (trim(p_category)) on conflict (name) do update set name = excluded.name returning id into category_id;
  insert into public.products(name, model, category_id) values (trim(p_name), trim(p_model), category_id) returning id into product_id;
  insert into public.product_variants(sku, product_id, variant_name, size, color, unit_price, unit_cost, minimum_stock)
    values (upper(trim(p_sku)), product_id, trim(p_variant_name), trim(p_size), trim(p_color), p_unit_price, p_unit_cost, p_minimum_stock);
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Produk', 'Menambahkan produk dan varian', upper(trim(p_sku)), jsonb_build_object('name', p_name, 'price', p_unit_price));
  return upper(trim(p_sku));
end; $$;

create or replace function public.update_product_price(p_sku text, p_unit_price numeric)
returns void language plpgsql security definer set search_path = public as $$
declare old_price numeric;
begin
  if not public.has_role(array['Produksi', 'Pemilik']) then raise exception 'Akses ditolak untuk mengubah harga produk'; end if;
  if p_unit_price < 0 then raise exception 'Harga jual tidak boleh negatif'; end if;
  select unit_price into old_price from public.product_variants where sku = p_sku and active = true for update;
  if not found then raise exception 'SKU aktif tidak ditemukan'; end if;
  update public.product_variants set unit_price = p_unit_price where sku = p_sku;
  insert into public.audit_logs(user_id, module, action, document_id, old_value, new_value)
    values (auth.uid(), 'Produk', 'Mengubah harga jual produk', p_sku, jsonb_build_object('unit_price', old_price), jsonb_build_object('unit_price', p_unit_price));
end; $$;

create or replace function public.record_stock_adjustment(p_item_type text, p_item_code text, p_movement_type text, p_quantity numeric, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare item_name text; item_cost numeric; minimum_stock numeric; adjustment_id text;
begin
  if not public.has_role(array['Gudang', 'Pemilik']) then raise exception 'Akses ditolak untuk mencatat mutasi stok'; end if;
  if p_movement_type not in ('MASUK', 'KELUAR') or p_quantity <= 0 then raise exception 'Jenis mutasi dan jumlah harus valid'; end if;
  if trim(coalesce(p_reason, '')) = '' then raise exception 'Alasan mutasi wajib diisi'; end if;
  if p_item_type = 'bahan_baku' then
    select name, unit_cost, raw_materials.minimum_stock into item_name, item_cost, minimum_stock from public.raw_materials where code = p_item_code and active = true;
  elsif p_item_type = 'produk_jadi' then
    select p.name || ' · ' || pv.variant_name, pv.unit_cost, pv.minimum_stock into item_name, item_cost, minimum_stock
      from public.product_variants pv join public.products p on p.id = pv.product_id where pv.sku = p_item_code and pv.active = true and p.active = true;
  else raise exception 'Jenis item tidak valid'; end if;
  if item_name is null then raise exception 'Item aktif tidak ditemukan'; end if;
  adjustment_id := 'ADJ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  insert into public.stock_movements(item_type, item_code, item_name, movement_type, quantity, unit_cost, minimum_stock, source_type, source_id, reason, created_by)
    values (p_item_type, p_item_code, item_name, p_movement_type, p_quantity, item_cost, minimum_stock, 'Penyesuaian Stok', adjustment_id, trim(p_reason), auth.uid());
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Persediaan', 'Mencatat mutasi stok', p_item_code, jsonb_build_object('movement_type', p_movement_type, 'quantity', p_quantity, 'reason', p_reason));
end; $$;

create or replace function public.update_user_profile(p_target_id uuid, p_full_name text, p_role text, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
declare current_role text; old_profile public.profiles; target_role text := nullif(trim(coalesce(p_role, '')), ''); target_name text := nullif(trim(coalesce(p_full_name, '')), '');
begin
  current_role := public.current_user_role();
  if current_role is null or current_role not in ('Pemilik', 'Admin') then raise exception 'Hanya Pemilik atau Admin yang dapat mengubah profil'; end if;
  select * into old_profile from public.profiles where id = p_target_id for update;
  if not found then raise exception 'Profil pengguna tidak ditemukan'; end if;
  if current_role = 'Admin' and (p_target_id = auth.uid() or old_profile.role = 'Pemilik' or target_role = 'Pemilik') then raise exception 'Admin tidak dapat mengubah akses akun sendiri atau akun Pemilik'; end if;
  if p_target_id = auth.uid() and current_role = 'Pemilik' and ((target_role is not null and target_role <> 'Pemilik') or p_active = false) then raise exception 'Pemilik tidak dapat menonaktifkan atau menurunkan hak akses akunnya sendiri'; end if;
  if target_role is not null and target_role not in ('Pemilik', 'Admin', 'Pengadaan', 'Gudang', 'Produksi', 'Penjualan', 'Keuangan') then raise exception 'Peran tidak dikenal'; end if;
  update public.profiles set full_name = coalesce(target_name, full_name), role = coalesce(target_role, role), active = coalesce(p_active, active) where id = p_target_id;
  insert into public.audit_logs(user_id, module, action, document_id, old_value, new_value)
    values (auth.uid(), 'Pengguna', 'Memperbarui profil dan hak akses', p_target_id::text,
      jsonb_build_object('full_name', old_profile.full_name, 'role', old_profile.role, 'active', old_profile.active),
      jsonb_build_object('full_name', coalesce(target_name, old_profile.full_name), 'role', coalesce(target_role, old_profile.role), 'active', coalesce(p_active, old_profile.active)));
end; $$;

create or replace function public.create_purchase_order(p_supplier_id uuid, p_material_code text, p_quantity numeric, p_unit_price numeric, p_order_date date)
returns text language plpgsql security definer set search_path = public as $$
declare order_number text; supplier_record public.suppliers;
begin
  if not public.has_role(array['Pengadaan']) then raise exception 'Hanya Pengadaan yang dapat membuat pesanan untuk diproses persetujuan Pemilik'; end if;
  if p_quantity <= 0 or p_unit_price < 0 then raise exception 'Jumlah harus lebih dari nol dan harga tidak boleh negatif'; end if;
  select * into supplier_record from public.suppliers where id = p_supplier_id and active = true;
  if not found then raise exception 'Pemasok aktif tidak ditemukan'; end if;
  if not exists (select 1 from public.raw_materials where code = p_material_code and active = true) then raise exception 'Bahan baku aktif tidak ditemukan'; end if;
  order_number := 'PO-' || to_char(coalesce(p_order_date, current_date), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.purchase_orders(id, supplier_id, supplier_name, order_date, total, status, created_by)
    values (order_number, supplier_record.id, supplier_record.name, coalesce(p_order_date, current_date), p_quantity * p_unit_price, 'Menunggu Persetujuan', auth.uid());
  insert into public.purchase_order_items(purchase_order_id, material_code, quantity, unit_price) values (order_number, p_material_code, p_quantity, p_unit_price);
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Pengadaan', 'Membuat pesanan pembelian', order_number, jsonb_build_object('supplier', supplier_record.name, 'total', p_quantity * p_unit_price));
  return order_number;
end; $$;

create or replace function public.receive_purchase_order(p_order_id text, p_item_id uuid, p_quantity numeric)
returns void language plpgsql security definer set search_path = public as $$
declare order_record public.purchase_orders; item_record public.purchase_order_items; material_record public.raw_materials; remaining numeric; received numeric; all_received boolean;
begin
  if not public.has_role(array['Gudang', 'Pemilik']) then raise exception 'Akses ditolak untuk menerima barang'; end if;
  select * into order_record from public.purchase_orders where id = p_order_id for update;
  if not found or order_record.status not in ('Dipesan', 'Diterima Sebagian') then raise exception 'Pesanan belum disetujui atau sudah selesai'; end if;
  select * into item_record from public.purchase_order_items where purchase_order_id = p_order_id and id = p_item_id for update;
  if not found then raise exception 'Baris bahan pada pesanan tidak ditemukan'; end if;
  remaining := item_record.quantity - item_record.received_quantity;
  if p_quantity <= 0 or p_quantity > remaining then raise exception 'Jumlah penerimaan harus antara 1 dan %', remaining; end if;
  select * into material_record from public.raw_materials where code = item_record.material_code;
  received := item_record.received_quantity + p_quantity;
  insert into public.stock_movements(item_type, item_code, item_name, movement_type, quantity, unit_cost, minimum_stock, source_type, source_id, reason, created_by)
    values ('bahan_baku', material_record.code, material_record.name, 'MASUK', p_quantity, item_record.unit_price, material_record.minimum_stock, 'Penerimaan Pembelian', p_order_id, 'Penerimaan barang pemasok', auth.uid());
  update public.purchase_order_items set received_quantity = received where id = item_record.id;
  select not exists (select 1 from public.purchase_order_items where purchase_order_id = p_order_id and received_quantity < quantity) into all_received;
  update public.purchase_orders set status = case when all_received then 'Selesai' else 'Diterima Sebagian' end where id = p_order_id;
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Persediaan', 'Menerima barang pembelian', p_order_id, jsonb_build_object('quantity', p_quantity, 'material', material_record.code));
end; $$;

create or replace function public.create_production_order(p_sku text, p_planned_quantity integer, p_target_date date)
returns text language plpgsql security definer set search_path = public as $$
declare order_number text; variant_record public.product_variants;
begin
  if not public.has_role(array['Produksi', 'Pemilik']) then raise exception 'Akses ditolak untuk membuat perintah produksi'; end if;
  if p_planned_quantity <= 0 then raise exception 'Jumlah produksi harus lebih dari nol'; end if;
  select * into variant_record from public.product_variants where sku = p_sku and active = true;
  if not found then raise exception 'SKU aktif tidak ditemukan'; end if;
  order_number := 'PRD-' || to_char(coalesce(p_target_date, current_date), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.production_orders(id, sku, variant_name, planned_quantity, status, target_date, created_by)
    values (order_number, variant_record.sku, variant_record.variant_name, p_planned_quantity, 'Direncanakan', p_target_date, auth.uid());
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Produksi', 'Membuat perintah produksi', order_number, jsonb_build_object('sku', p_sku, 'quantity', p_planned_quantity));
  return order_number;
end; $$;

create or replace function public.update_production_status(p_order_id text, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare old_status text;
begin
  if not public.has_role(array['Produksi', 'Pemilik']) then raise exception 'Akses ditolak untuk memperbarui produksi'; end if;
  if p_status not in ('Diproses', 'Menunggu QC', 'Dibatalkan') then raise exception 'Status tujuan tidak valid'; end if;
  select status into old_status from public.production_orders where id = p_order_id for update;
  if old_status is null or old_status in ('Selesai', 'Selesai QC', 'Dibatalkan') then raise exception 'Perintah tidak dapat diubah dari status saat ini'; end if;
  update public.production_orders set status = p_status where id = p_order_id;
  insert into public.audit_logs(user_id, module, action, document_id, old_value, new_value)
    values (auth.uid(), 'Produksi', 'Memperbarui status produksi', p_order_id, jsonb_build_object('status', old_status), jsonb_build_object('status', p_status));
end; $$;

create or replace function public.record_quality_check(p_order_id text, p_inspected integer, p_passed integer, p_rework integer, p_failed integer)
returns void language plpgsql security definer set search_path = public as $$
declare order_record public.production_orders; variant_record public.product_variants; product_record public.products; bom_record record; already_inspected integer;
begin
  if not public.has_role(array['Produksi', 'Pemilik']) then raise exception 'Akses ditolak untuk mencatat QC'; end if;
  select * into order_record from public.production_orders where id = p_order_id for update;
  if not found or order_record.status not in ('Diproses', 'Menunggu QC') then raise exception 'Perintah produksi belum siap diperiksa'; end if;
  if p_inspected <= 0 or p_passed < 0 or p_rework < 0 or p_failed < 0 or p_passed + p_rework + p_failed <> p_inspected then raise exception 'Hasil QC harus sama dengan jumlah yang diperiksa'; end if;
  if not exists (select 1 from public.product_variants pv join public.bills_of_materials b on b.product_id = pv.product_id and b.active = true join public.bom_items bi on bi.bom_id = b.id where pv.sku = order_record.sku) then raise exception 'BOM aktif belum disiapkan. Atur komposisi produk sebelum mencatat QC'; end if;
  select coalesce(sum(inspected_quantity), 0) into already_inspected from public.quality_checks where production_order_id = p_order_id;
  if p_inspected > order_record.planned_quantity - already_inspected then raise exception 'Jumlah diperiksa melebihi sisa rencana produksi'; end if;
  insert into public.quality_checks(production_order_id, inspected_quantity, passed_quantity, rework_quantity, failed_quantity, checked_by)
    values (p_order_id, p_inspected, p_passed, p_rework, p_failed, auth.uid());
  select * into variant_record from public.product_variants where sku = order_record.sku;
  select * into product_record from public.products where id = variant_record.product_id;
  for bom_record in select bi.material_code, bi.quantity_per_unit, rm.name, rm.unit_cost, rm.minimum_stock
    from public.bills_of_materials b join public.bom_items bi on bi.bom_id = b.id join public.raw_materials rm on rm.code = bi.material_code
    where b.product_id = variant_record.product_id and b.active = true
  loop
    insert into public.stock_movements(item_type, item_code, item_name, movement_type, quantity, unit_cost, minimum_stock, source_type, source_id, reason, created_by)
      values ('bahan_baku', bom_record.material_code, bom_record.name, 'KELUAR', bom_record.quantity_per_unit * p_inspected, bom_record.unit_cost, bom_record.minimum_stock, 'Produksi', p_order_id, 'Pemakaian bahan produksi', auth.uid());
  end loop;
  if p_passed > 0 then
    insert into public.stock_movements(item_type, item_code, item_name, movement_type, quantity, unit_cost, minimum_stock, source_type, source_id, reason, created_by)
      values ('produk_jadi', variant_record.sku, product_record.name || ' · ' || variant_record.variant_name, 'MASUK', p_passed, variant_record.unit_cost, variant_record.minimum_stock, 'Hasil Produksi', p_order_id, 'Hasil QC lolos', auth.uid());
  end if;
  update public.production_orders set result_quantity = result_quantity + p_passed,
    status = case when already_inspected + p_inspected >= planned_quantity then 'Selesai QC' else 'Diproses' end where id = p_order_id;
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Produksi', 'Mencatat hasil QC', p_order_id, jsonb_build_object('inspected', p_inspected, 'passed', p_passed, 'rework', p_rework, 'failed', p_failed));
end; $$;

create or replace function public.create_sale(p_customer_id uuid, p_sku text, p_quantity integer, p_discount numeric)
returns text language plpgsql security definer set search_path = public as $$
declare sale_number text; customer_record public.customers; variant_record public.product_variants; sale_total numeric;
begin
  if not public.has_role(array['Penjualan', 'Pemilik']) then raise exception 'Akses ditolak untuk membuat transaksi penjualan'; end if;
  if p_quantity <= 0 or p_discount < 0 then raise exception 'Jumlah harus positif dan diskon tidak boleh negatif'; end if;
  select * into customer_record from public.customers where id = p_customer_id;
  if not found then raise exception 'Pelanggan tidak ditemukan'; end if;
  select * into variant_record from public.product_variants where sku = p_sku and active = true;
  if not found then raise exception 'SKU aktif tidak ditemukan'; end if;
  sale_total := p_quantity * variant_record.unit_price - p_discount;
  if sale_total < 0 then raise exception 'Diskon tidak boleh melebihi subtotal'; end if;
  sale_number := 'INV-' || to_char(current_date, 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.sales(id, customer_id, customer_name, total, discount, status, payment_status, created_by)
    values (sale_number, customer_record.id, customer_record.name, sale_total, p_discount, 'Baru', 'Belum Dibayar', auth.uid());
  insert into public.sale_items(sale_id, sku, quantity, unit_price, discount) values (sale_number, variant_record.sku, p_quantity, variant_record.unit_price, p_discount);
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Penjualan', 'Membuat transaksi penjualan', sale_number, jsonb_build_object('sku', p_sku, 'quantity', p_quantity, 'total', sale_total));
  return sale_number;
end; $$;

create or replace function public.fulfill_sale(p_sale_id text)
returns void language plpgsql security definer set search_path = public as $$
declare sale_record public.sales; item_record record;
begin
  if not public.has_role(array['Gudang', 'Penjualan', 'Pemilik']) then raise exception 'Akses ditolak untuk memenuhi pesanan'; end if;
  select * into sale_record from public.sales where id = p_sale_id for update;
  if not found or sale_record.status not in ('Baru', 'Menunggu Pengeluaran Barang', 'Terpenuhi Sebagian') then raise exception 'Pesanan tidak dapat dipenuhi dari status saat ini'; end if;
  for item_record in select si.*, pv.variant_name, pv.unit_cost, pv.minimum_stock, p.name
    from public.sale_items si join public.product_variants pv on pv.sku = si.sku join public.products p on p.id = pv.product_id where si.sale_id = p_sale_id
  loop
    insert into public.stock_movements(item_type, item_code, item_name, movement_type, quantity, unit_cost, minimum_stock, source_type, source_id, reason, created_by)
      values ('produk_jadi', item_record.sku, item_record.name || ' · ' || item_record.variant_name, 'KELUAR', item_record.quantity, item_record.unit_cost, item_record.minimum_stock, 'Penjualan', p_sale_id, 'Pemenuhan pesanan pelanggan', auth.uid());
  end loop;
  update public.sales set status = 'Terpenuhi' where id = p_sale_id;
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Penjualan', 'Memenuhi pesanan pelanggan', p_sale_id, jsonb_build_object('status', 'Terpenuhi'));
end; $$;

create or replace function public.record_sale_payment(p_sale_id text, p_amount numeric)
returns text language plpgsql security definer set search_path = public as $$
declare sale_record public.sales; payment_ref text; reserved_amount numeric;
begin
  if not public.has_role(array['Penjualan', 'Keuangan', 'Pemilik']) then raise exception 'Akses ditolak untuk mencatat pembayaran'; end if;
  if p_amount <= 0 then raise exception 'Nilai pembayaran harus lebih dari nol'; end if;
  select * into sale_record from public.sales where id = p_sale_id for update;
  if not found or sale_record.status = 'Dibatalkan' then raise exception 'Transaksi tidak ditemukan atau dibatalkan'; end if;
  select coalesce(sum(amount), 0) into reserved_amount from public.financial_transactions
    where source_type = 'Pembayaran Penjualan' and split_part(source_id, ':', 1) = p_sale_id and direction = 'MASUK' and status <> 'Dibatalkan';
  if reserved_amount + p_amount > sale_record.total then raise exception 'Total pembayaran melebihi nilai transaksi'; end if;
  payment_ref := 'PAY-' || to_char(current_date, 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.financial_transactions(id, direction, amount, source_type, source_id, status, created_by)
    values (payment_ref, 'MASUK', p_amount, 'Pembayaran Penjualan', p_sale_id || ':' || payment_ref, 'Menunggu Verifikasi', auth.uid());
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Keuangan', 'Mencatat pembayaran penjualan', p_sale_id, jsonb_build_object('payment_ref', payment_ref, 'amount', p_amount));
  return payment_ref;
end; $$;

create or replace function public.create_expense(p_expense_type text, p_amount numeric, p_description text, p_date date)
returns text language plpgsql security definer set search_path = public as $$
declare expense_ref text; transaction_ref text;
begin
  if not public.has_role(array['Keuangan', 'Pemilik']) then raise exception 'Akses ditolak untuk mencatat biaya'; end if;
  if trim(p_expense_type) = '' or p_amount <= 0 then raise exception 'Jenis biaya wajib diisi dan nilai harus lebih dari nol'; end if;
  expense_ref := 'EXP-' || to_char(coalesce(p_date, current_date), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  transaction_ref := 'FIN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  insert into public.operating_expenses(id, expense_type, amount, description, transaction_date, created_by)
    values (expense_ref, trim(p_expense_type), p_amount, nullif(trim(p_description), ''), coalesce(p_date, current_date), auth.uid());
  insert into public.financial_transactions(id, direction, amount, source_type, source_id, status, transaction_date, created_by)
    values (transaction_ref, 'KELUAR', p_amount, 'Biaya', expense_ref, 'Menunggu Verifikasi', coalesce(p_date, current_date), auth.uid());
  insert into public.audit_logs(user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Keuangan', 'Mencatat biaya operasional', expense_ref, jsonb_build_object('type', p_expense_type, 'amount', p_amount));
  return expense_ref;
end; $$;

create or replace function public.verify_financial_transaction(p_transaction_id text, p_decision text)
returns void language plpgsql security definer set search_path = public as $$
declare old_status text; transaction_record public.financial_transactions; sale_ref text; paid_amount numeric; sale_total numeric;
begin
  if not public.has_role(array['Keuangan', 'Pemilik']) then raise exception 'Akses ditolak untuk memverifikasi transaksi'; end if;
  if p_decision not in ('Terverifikasi', 'Dibatalkan') then raise exception 'Keputusan transaksi tidak valid'; end if;
  select * into transaction_record from public.financial_transactions where id = p_transaction_id for update;
  old_status := transaction_record.status;
  if not found or old_status is distinct from 'Menunggu Verifikasi' then raise exception 'Transaksi tidak ditemukan atau sudah diproses'; end if;
  update public.financial_transactions set status = p_decision, verified_by = auth.uid() where id = p_transaction_id;
  if transaction_record.source_type = 'Pembayaran Penjualan' then
    sale_ref := split_part(transaction_record.source_id, ':', 1);
    select coalesce(sum(amount), 0) into paid_amount from public.financial_transactions
      where source_type = 'Pembayaran Penjualan' and split_part(source_id, ':', 1) = sale_ref and direction = 'MASUK' and status = 'Terverifikasi';
    select total into sale_total from public.sales where id = sale_ref;
    update public.sales set payment_status = case when paid_amount >= sale_total then 'Lunas' when paid_amount > 0 then 'Sebagian' else 'Belum Dibayar' end where id = sale_ref;
  end if;
  insert into public.audit_logs(user_id, module, action, document_id, old_value, new_value)
    values (auth.uid(), 'Keuangan', 'Memproses verifikasi transaksi', p_transaction_id, jsonb_build_object('status', old_status), jsonb_build_object('status', p_decision));
end; $$;

revoke all on function public.create_product_variant(text,text,text,text,text,text,text,numeric,numeric,numeric) from public;
revoke all on function public.create_support_ticket(text,text,text) from public;
revoke all on function public.update_support_ticket(uuid,text) from public;
revoke all on function public.create_supplier(text,text,text) from public;
revoke all on function public.create_raw_material(text,text,text,text,numeric,numeric) from public;
revoke all on function public.create_customer(text,text,text) from public;
revoke all on function public.add_bom_material(uuid,text,numeric) from public;
revoke all on function public.update_product_price(text,numeric) from public;
revoke all on function public.record_stock_adjustment(text,text,text,numeric,text) from public;
revoke all on function public.update_user_profile(uuid,text,text,boolean) from public;
revoke all on function public.create_purchase_order(uuid,text,numeric,numeric,date) from public;
revoke all on function public.receive_purchase_order(text,uuid,numeric) from public;
revoke all on function public.create_production_order(text,integer,date) from public;
revoke all on function public.update_production_status(text,text) from public;
revoke all on function public.record_quality_check(text,integer,integer,integer,integer) from public;
revoke all on function public.create_sale(uuid,text,integer,numeric) from public;
revoke all on function public.fulfill_sale(text) from public;
revoke all on function public.record_sale_payment(text,numeric) from public;
revoke all on function public.create_expense(text,numeric,text,date) from public;
revoke all on function public.verify_financial_transaction(text,text) from public;
grant execute on function public.create_product_variant(text,text,text,text,text,text,text,numeric,numeric,numeric) to authenticated;
grant execute on function public.create_support_ticket(text,text,text) to authenticated;
grant execute on function public.update_support_ticket(uuid,text) to authenticated;
grant execute on function public.create_supplier(text,text,text) to authenticated;
grant execute on function public.create_raw_material(text,text,text,text,numeric,numeric) to authenticated;
grant execute on function public.create_customer(text,text,text) to authenticated;
grant execute on function public.add_bom_material(uuid,text,numeric) to authenticated;
grant execute on function public.update_product_price(text,numeric) to authenticated;
grant execute on function public.record_stock_adjustment(text,text,text,numeric,text) to authenticated;
grant execute on function public.update_user_profile(uuid,text,text,boolean) to authenticated;
grant execute on function public.create_purchase_order(uuid,text,numeric,numeric,date) to authenticated;
grant execute on function public.receive_purchase_order(text,uuid,numeric) to authenticated;
grant execute on function public.create_production_order(text,integer,date) to authenticated;
grant execute on function public.update_production_status(text,text) to authenticated;
grant execute on function public.record_quality_check(text,integer,integer,integer,integer) to authenticated;
grant execute on function public.create_sale(uuid,text,integer,numeric) to authenticated;
grant execute on function public.fulfill_sale(text) to authenticated;
grant execute on function public.record_sale_payment(text,numeric) to authenticated;
grant execute on function public.create_expense(text,numeric,text,date) to authenticated;
grant execute on function public.verify_financial_transaction(text,text) to authenticated;
