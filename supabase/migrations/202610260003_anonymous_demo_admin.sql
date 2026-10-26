-- The prototype's one-click demo login uses Supabase Anonymous Sign-ins.
-- Apply after 202610260001_initial_schema.sql and 202610260002_workflows.sql.

create or replace function public.has_role(allowed_roles text[])
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce(
    public.current_user_role() = 'Admin'
    or public.current_user_role() = any(allowed_roles),
    false
  );
$$;

-- Keep owner-level profile management exclusive to the actual Pemilik role.
drop policy if exists "owner creates profiles" on public.profiles;
create policy "owner creates profiles" on public.profiles for insert to authenticated
  with check (public.current_user_role() = 'Pemilik');
drop policy if exists "owner updates profiles" on public.profiles;
create policy "owner updates profiles" on public.profiles for update to authenticated
  using (public.current_user_role() = 'Pemilik')
  with check (public.current_user_role() = 'Pemilik');

create or replace function public.create_demo_admin_profile()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if coalesce(new.is_anonymous, false) then
    insert into public.profiles (id, full_name, role, active)
    values (new.id, 'Admin Demo', 'Admin', true)
    on conflict (id) do update
      set full_name = 'Admin Demo', role = 'Admin', active = true;
  end if;
  return new;
end;
$$;

drop trigger if exists create_demo_admin_profile on auth.users;
create trigger create_demo_admin_profile
  after insert on auth.users
  for each row execute function public.create_demo_admin_profile();
