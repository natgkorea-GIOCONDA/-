-- Security hardening for the live Gangnam CEO Directory Supabase project.
-- Run this in Supabase SQL Editor after backing up the current policy list.

alter table public.profiles add column if not exists role text;
alter table public.members add column if not exists user_id uuid references auth.users(id) on delete set null;

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
drop policy if exists "approved users read visible consented members" on public.members;
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
create policy "admins read all members" on public.members
  for select to authenticated
  using (public.is_current_user_admin());

drop policy if exists "admins insert members" on public.members;
create policy "admins insert members" on public.members
  for insert to authenticated
  with check (public.is_current_user_admin());

drop policy if exists "admins update members" on public.members;
create policy "admins update members" on public.members
  for update to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

drop policy if exists "admins delete members" on public.members;
create policy "admins delete members" on public.members
  for delete to authenticated
  using (public.is_current_user_admin());

create index if not exists members_user_id_idx on public.members(user_id);
create index if not exists members_visible_consent_idx on public.members(is_visible, privacy_consent);
