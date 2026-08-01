-- Gangnam CEO Directory schema
create extension if not exists pgcrypto;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
-- First admin setup: after creating a Supabase Auth user, run:
-- insert into public.profiles (id, email, is_admin) values ('AUTH_USER_UUID','admin@example.com',true)
-- on conflict (id) do update set is_admin = true;
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  cohort integer not null check (cohort between 1 and 32),
  company_name text not null,
  position text,
  company_address text,
  email text,
  phone text,
  website text,
  industry text,
  business_type text,
  company_intro text,
  photo_url text,
  privacy_consent boolean not null default false,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists members_updated_at on public.members;
create trigger members_updated_at before update on public.members for each row execute function public.set_updated_at();
alter table public.profiles enable row level security;
alter table public.members enable row level security;
create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.is_admin
        or p.role in ('super_admin', 'co_admin')
        or p.email = 'natgkorea@gmail.com'
      )
  );
$$;

create or replace function public.is_current_user_approved_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members m
    where m.user_id = auth.uid()
      and m.is_visible = true
      and m.privacy_consent = true
  );
$$;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_current_user_admin());

drop policy if exists "visible consented members readable" on public.members;
create policy "approved users read visible consented members" on public.members
  for select to authenticated
  using (
    is_visible = true
    and privacy_consent = true
    and (public.is_current_user_admin() or public.is_current_user_approved_member())
  );

drop policy if exists "members read own row" on public.members;
create policy "members read own row" on public.members
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "members insert own pending row" on public.members;
create policy "members insert own pending row" on public.members
  for insert to authenticated
  with check (user_id = auth.uid() and is_visible = false);

drop policy if exists "members update own pending row" on public.members;
create policy "members update own pending row" on public.members
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and is_visible = false);

drop policy if exists "admins read all members" on public.members;
create policy "admins read all members" on public.members for select to authenticated using (public.is_current_user_admin());
drop policy if exists "admins insert members" on public.members;
create policy "admins insert members" on public.members for insert to authenticated with check (public.is_current_user_admin());
drop policy if exists "admins update members" on public.members;
create policy "admins update members" on public.members for update to authenticated using (public.is_current_user_admin());
drop policy if exists "admins delete members" on public.members;
create policy "admins delete members" on public.members for delete to authenticated using (public.is_current_user_admin());
insert into storage.buckets (id, name, public) values ('member-photos','member-photos',true) on conflict (id) do nothing;


-- Public profile photos are readable, but only admins can mutate files in this bucket.
drop policy if exists "public read member photos" on storage.objects;
create policy "public read member photos" on storage.objects
  for select to public
  using (bucket_id = 'member-photos');

drop policy if exists "admins upload member photos" on storage.objects;
create policy "admins upload member photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'member-photos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "admins update member photos" on storage.objects;
create policy "admins update member photos" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'member-photos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  )
  with check (
    bucket_id = 'member-photos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "admins delete member photos" on storage.objects;
create policy "admins delete member photos" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'member-photos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
