create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('Pemilik', 'Admin', 'Pengadaan', 'Gudang', 'Produksi', 'Penjualan', 'Keuangan')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.product_categories (id uuid primary key default gen_random_uuid(), name text not null unique, created_at timestamptz not null default now());
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.product_categories(id),
  model text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.product_variants (
  sku text primary key,
  product_id uuid not null references public.products(id),
  variant_name text not null,
  size text not null,
  color text not null,
  unit_price numeric(14,2) not null check (unit_price >= 0),
  unit_cost numeric(14,2) not null default 0 check (unit_cost >= 0),
  minimum_stock numeric(14,3) not null default 0 check (minimum_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, size, color)
);
create table public.raw_materials (
  code text primary key,
  name text not null,
  material_type text not null,
  unit text not null,
  unit_cost numeric(14,2) not null default 0 check (unit_cost >= 0),
  minimum_stock numeric(14,3) not null default 0 check (minimum_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.suppliers (id uuid primary key default gen_random_uuid(), name text not null, contact text, address text, active boolean not null default true, created_at timestamptz not null default now());
create table public.customers (id uuid primary key default gen_random_uuid(), name text not null, contact text, address text, created_at timestamptz not null default now());
create table public.bills_of_materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  version integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, version)
);
create table public.bom_items (
  id uuid primary key default gen_random_uuid(),
  bom_id uuid not null references public.bills_of_materials(id) on delete cascade,
  material_code text not null references public.raw_materials(code),
  quantity_per_unit numeric(14,3) not null check (quantity_per_unit > 0),
  unique (bom_id, material_code)
);
create table public.purchase_orders (
  id text primary key,
  supplier_id uuid references public.suppliers(id),
  supplier_name text not null,
  order_date date not null default current_date,
  total numeric(14,2) not null default 0 check (total >= 0),
  status text not null default 'Draft' check (status in ('Draft', 'Menunggu Persetujuan', 'Dipesan', 'Diterima Sebagian', 'Selesai', 'Dibatalkan')),
  created_by uuid references public.profiles(id),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id text not null references public.purchase_orders(id),
  material_code text not null references public.raw_materials(code),
  quantity numeric(14,3) not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  received_quantity numeric(14,3) not null default 0 check (received_quantity >= 0 and received_quantity <= quantity)
);
create table public.production_orders (
  id text primary key,
  sku text not null references public.product_variants(sku),
  variant_name text not null,
  planned_quantity integer not null check (planned_quantity > 0),
  result_quantity integer not null default 0 check (result_quantity >= 0),
  status text not null default 'Direncanakan' check (status in ('Direncanakan', 'Diproses', 'Menunggu QC', 'Selesai QC', 'Selesai', 'Dibatalkan')),
  target_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.sales (
  id text primary key,
  customer_id uuid references public.customers(id),
  customer_name text not null,
  total numeric(14,2) not null check (total >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  status text not null default 'Baru' check (status in ('Baru', 'Menunggu Pengeluaran Barang', 'Terpenuhi Sebagian', 'Terpenuhi', 'Selesai', 'Menunggu pembayaran', 'Dibatalkan')),
  payment_status text not null default 'Belum Dibayar' check (payment_status in ('Belum Dibayar', 'Sebagian', 'Lunas')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id text not null references public.sales(id),
  sku text not null references public.product_variants(sku),
  quantity integer not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0)
);
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('bahan_baku', 'produk_jadi')),
  item_code text not null,
  item_name text not null,
  movement_type text not null check (movement_type in ('MASUK', 'KELUAR')),
  quantity numeric(14,3) not null check (quantity > 0),
  unit_cost numeric(14,2) not null default 0 check (unit_cost >= 0),
  minimum_stock numeric(14,3) not null default 0 check (minimum_stock >= 0),
  source_type text not null,
  source_id text not null,
  reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.quality_checks (
  id uuid primary key default gen_random_uuid(),
  production_order_id text not null references public.production_orders(id),
  inspected_quantity integer not null check (inspected_quantity >= 0),
  passed_quantity integer not null check (passed_quantity >= 0),
  rework_quantity integer not null check (rework_quantity >= 0),
  failed_quantity integer not null check (failed_quantity >= 0),
  checked_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  check (passed_quantity + rework_quantity + failed_quantity = inspected_quantity)
);
create table public.operating_expenses (
  id text primary key,
  expense_type text not null,
  amount numeric(14,2) not null check (amount > 0),
  description text,
  transaction_date date not null default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.financial_transactions (
  id text primary key,
  direction text not null check (direction in ('MASUK', 'KELUAR')),
  amount numeric(14,2) not null check (amount > 0),
  source_type text not null,
  source_id text not null,
  status text not null default 'Menunggu Verifikasi' check (status in ('Menunggu Verifikasi', 'Terverifikasi', 'Dibatalkan')),
  transaction_date date not null default current_date,
  verified_by uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (source_type, source_id, direction)
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  module text not null,
  action text not null,
  document_id text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create or replace view public.stock_balances with (security_invoker = true) as
select m.item_type, m.item_code, max(m.item_name) as item_name,
       greatest(sum(case when m.movement_type = 'MASUK' then m.quantity else -m.quantity end), 0) as quantity,
       max(m.minimum_stock) as minimum_stock, max(m.unit_cost) as unit_cost
from public.stock_movements as m
group by m.item_type, m.item_code;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() and active = true limit 1; $$;
create or replace function public.has_role(allowed_roles text[])
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce(public.current_user_role() = any(allowed_roles), false); $$;

create or replace function public.reject_negative_stock()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  available numeric(14,3);
begin
  perform pg_advisory_xact_lock(hashtext(new.item_type), hashtext(new.item_code));
  select coalesce(sum(case when movement_type = 'MASUK' then quantity else -quantity end), 0)
    into available
    from public.stock_movements
    where item_type = new.item_type and item_code = new.item_code;
  if new.movement_type = 'KELUAR' and new.quantity > available then
    raise exception 'Stok tidak mencukupi untuk item % (tersedia: %, diminta: %)', new.item_code, available, new.quantity;
  end if;
  return new;
end;
$$;
create trigger stock_movement_guard before insert on public.stock_movements
for each row execute function public.reject_negative_stock();

create or replace function public.approve_purchase_order(order_number text)
returns public.purchase_orders language plpgsql security definer set search_path = public
as $$
declare
  approved_order public.purchase_orders;
begin
  if public.current_user_role() <> 'Pemilik' then
    raise exception 'Hanya Pemilik yang dapat menyetujui pesanan pembelian';
  end if;
  update public.purchase_orders
    set status = 'Dipesan', approved_by = auth.uid(), approved_at = now()
    where id = order_number
      and status = 'Menunggu Persetujuan'
      and created_by <> auth.uid()
    returning * into approved_order;
  if not found then
    raise exception 'Pesanan tidak tersedia untuk disetujui atau dibuat oleh pengguna yang sama';
  end if;
  insert into public.audit_logs (user_id, module, action, document_id, new_value)
    values (auth.uid(), 'Pengadaan', 'Menyetujui pesanan pembelian', order_number, jsonb_build_object('status', 'Dipesan'));
  return approved_order;
end;
$$;
revoke all on function public.approve_purchase_order(text) from public;
grant execute on function public.approve_purchase_order(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.raw_materials enable row level security;
alter table public.suppliers enable row level security;
alter table public.customers enable row level security;
alter table public.bills_of_materials enable row level security;
alter table public.bom_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.production_orders enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.quality_checks enable row level security;
alter table public.operating_expenses enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.audit_logs enable row level security;

create policy "users can read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(array['Pemilik', 'Admin']));
create policy "owner creates profiles" on public.profiles for insert to authenticated with check (public.has_role(array['Pemilik']));
create policy "owner updates profiles" on public.profiles for update to authenticated using (public.has_role(array['Pemilik'])) with check (public.has_role(array['Pemilik']));
create policy "admin creates staff profiles" on public.profiles for insert to authenticated with check (public.has_role(array['Admin']) and role <> 'Pemilik');
create policy "admin updates other staff profiles" on public.profiles for update to authenticated using (public.has_role(array['Admin']) and id <> auth.uid() and role <> 'Pemilik') with check (public.has_role(array['Admin']) and id <> auth.uid() and role <> 'Pemilik');
create policy "staff read categories" on public.product_categories for select to authenticated using (public.current_user_role() is not null);
create policy "admin manages categories" on public.product_categories for all to authenticated using (public.has_role(array['Admin'])) with check (public.has_role(array['Admin']));
create policy "staff read products" on public.products for select to authenticated using (public.current_user_role() is not null);
create policy "production manages products" on public.products for all to authenticated using (public.has_role(array['Produksi', 'Pemilik'])) with check (public.has_role(array['Produksi', 'Pemilik']));
create policy "staff read variants" on public.product_variants for select to authenticated using (public.current_user_role() is not null);
create policy "production manages variants" on public.product_variants for all to authenticated using (public.has_role(array['Produksi', 'Pemilik'])) with check (public.has_role(array['Produksi', 'Pemilik']));
create policy "staff read materials" on public.raw_materials for select to authenticated using (public.current_user_role() is not null);
create policy "procurement manages materials" on public.raw_materials for all to authenticated using (public.has_role(array['Pengadaan', 'Pemilik'])) with check (public.has_role(array['Pengadaan', 'Pemilik']));
create policy "staff read suppliers" on public.suppliers for select to authenticated using (public.current_user_role() is not null);
create policy "procurement manages suppliers" on public.suppliers for all to authenticated using (public.has_role(array['Pengadaan'])) with check (public.has_role(array['Pengadaan']));
create policy "staff read customers" on public.customers for select to authenticated using (public.current_user_role() is not null);
create policy "sales manages customers" on public.customers for all to authenticated using (public.has_role(array['Penjualan'])) with check (public.has_role(array['Penjualan']));
create policy "staff reads bom" on public.bills_of_materials for select to authenticated using (public.current_user_role() is not null);
create policy "production manages bom" on public.bills_of_materials for all to authenticated using (public.has_role(array['Produksi', 'Pemilik'])) with check (public.has_role(array['Produksi', 'Pemilik']));
create policy "staff read bom items" on public.bom_items for select to authenticated using (public.current_user_role() is not null);
create policy "production manages bom items" on public.bom_items for all to authenticated using (public.has_role(array['Produksi', 'Pemilik'])) with check (public.has_role(array['Produksi', 'Pemilik']));
create policy "authorized roles read purchase orders" on public.purchase_orders for select to authenticated using (public.has_role(array['Pemilik', 'Pengadaan', 'Gudang', 'Keuangan']));
create policy "procurement creates purchase orders" on public.purchase_orders for insert to authenticated with check (public.has_role(array['Pengadaan']) and created_by = auth.uid() and status in ('Draft', 'Menunggu Persetujuan'));
create policy "procurement updates drafts" on public.purchase_orders for update to authenticated using (public.has_role(array['Pengadaan']) and created_by = auth.uid() and status in ('Draft', 'Menunggu Persetujuan')) with check (public.has_role(array['Pengadaan']) and created_by = auth.uid() and status in ('Draft', 'Menunggu Persetujuan'));
create policy "authorized roles read purchase order items" on public.purchase_order_items for select to authenticated using (public.has_role(array['Pemilik', 'Pengadaan', 'Gudang', 'Keuangan']));
create policy "procurement adds draft purchase items" on public.purchase_order_items for insert to authenticated with check (public.has_role(array['Pengadaan']) and exists (select 1 from public.purchase_orders po where po.id = purchase_order_id and po.created_by = auth.uid() and po.status in ('Draft', 'Menunggu Persetujuan')));
create policy "procurement updates draft purchase items" on public.purchase_order_items for update to authenticated using (public.has_role(array['Pengadaan']) and exists (select 1 from public.purchase_orders po where po.id = purchase_order_id and po.created_by = auth.uid() and po.status in ('Draft', 'Menunggu Persetujuan'))) with check (public.has_role(array['Pengadaan']) and exists (select 1 from public.purchase_orders po where po.id = purchase_order_id and po.created_by = auth.uid() and po.status in ('Draft', 'Menunggu Persetujuan')));
create policy "authorized roles read production orders" on public.production_orders for select to authenticated using (public.has_role(array['Pemilik', 'Produksi', 'Gudang', 'Keuangan']));
create policy "production creates orders" on public.production_orders for insert to authenticated with check (public.has_role(array['Produksi']) and created_by = auth.uid() and status = 'Direncanakan');
create policy "production updates orders" on public.production_orders for update to authenticated using (public.has_role(array['Produksi']) and created_by = auth.uid() and status not in ('Selesai', 'Dibatalkan')) with check (public.has_role(array['Produksi']) and created_by = auth.uid() and status in ('Direncanakan', 'Diproses', 'Menunggu QC', 'Selesai QC', 'Dibatalkan'));
create policy "authorized roles read sales" on public.sales for select to authenticated using (public.has_role(array['Pemilik', 'Gudang', 'Penjualan', 'Keuangan']));
create policy "sales creates sales" on public.sales for insert to authenticated with check (public.has_role(array['Penjualan']) and created_by = auth.uid() and status = 'Baru' and payment_status = 'Belum Dibayar');
create policy "sales updates open orders" on public.sales for update to authenticated using (public.has_role(array['Penjualan']) and created_by = auth.uid() and status in ('Baru', 'Menunggu Pengeluaran Barang')) with check (public.has_role(array['Penjualan']) and created_by = auth.uid() and status in ('Baru', 'Menunggu Pengeluaran Barang'));
create policy "authorized roles read sale items" on public.sale_items for select to authenticated using (public.has_role(array['Pemilik', 'Gudang', 'Penjualan', 'Keuangan']));
create policy "sales adds sale items" on public.sale_items for insert to authenticated with check (public.has_role(array['Penjualan']) and exists (select 1 from public.sales s where s.id = sale_id and s.created_by = auth.uid() and s.status = 'Baru'));
create policy "sales updates sale items" on public.sale_items for update to authenticated using (public.has_role(array['Penjualan']) and exists (select 1 from public.sales s where s.id = sale_id and s.created_by = auth.uid() and s.status = 'Baru')) with check (public.has_role(array['Penjualan']) and exists (select 1 from public.sales s where s.id = sale_id and s.created_by = auth.uid() and s.status = 'Baru'));
create policy "authorized roles read stock movements" on public.stock_movements for select to authenticated using (public.has_role(array['Pemilik', 'Pengadaan', 'Gudang', 'Produksi', 'Penjualan', 'Keuangan']));
create policy "warehouse records stock movements" on public.stock_movements for insert to authenticated with check (public.has_role(array['Gudang']) and created_by = auth.uid());
create policy "authorized roles read quality checks" on public.quality_checks for select to authenticated using (public.has_role(array['Pemilik', 'Produksi', 'Gudang']));
create policy "production records qc" on public.quality_checks for insert to authenticated with check (public.has_role(array['Produksi']) and checked_by = auth.uid());
create policy "finance reads expenses" on public.operating_expenses for select to authenticated using (public.has_role(array['Keuangan', 'Pemilik']));
create policy "finance records expenses" on public.operating_expenses for insert to authenticated with check (public.has_role(array['Keuangan']) and created_by = auth.uid());
create policy "finance reads transactions" on public.financial_transactions for select to authenticated using (public.has_role(array['Keuangan', 'Pemilik']));
create policy "finance records transactions" on public.financial_transactions for insert to authenticated with check (public.has_role(array['Keuangan', 'Penjualan']) and created_by = auth.uid() and status = 'Menunggu Verifikasi');
create policy "finance verifies transactions" on public.financial_transactions for update to authenticated using (public.has_role(array['Keuangan']) and status = 'Menunggu Verifikasi') with check (public.has_role(array['Keuangan']) and status in ('Terverifikasi', 'Dibatalkan') and verified_by = auth.uid());
create policy "owner and admin read audit logs" on public.audit_logs for select to authenticated using (public.has_role(array['Pemilik', 'Admin']));
create policy "signed in user writes audit logs" on public.audit_logs for insert to authenticated with check (user_id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert, update on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant select on public.stock_balances to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.has_role(text[]) to authenticated;
insert into public.product_categories (name) values ('Baju'), ('Celana'), ('Sepatu') on conflict (name) do nothing;
