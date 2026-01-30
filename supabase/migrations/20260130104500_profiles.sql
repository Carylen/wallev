-- Profiles for display names and avatars

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles viewable by authenticated"
  on public.profiles
  for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their profile"
  on public.profiles
  for insert
  with check (id = auth.uid());

create policy "Users can update their profile"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

grant select, insert, update on public.profiles to authenticated;

create or replace view public.ledger_members_view as
select
  m.ledger_id,
  m.user_id,
  m.role,
  m.created_at,
  p.full_name,
  p.avatar_url
from public.ledger_members m
left join public.profiles p
  on p.id = m.user_id;

grant select on public.ledger_members_view to authenticated;
