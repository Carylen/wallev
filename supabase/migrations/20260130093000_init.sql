-- Wallev initial schema (consolidated)

create extension if not exists "pgcrypto";

create table if not exists public.ledgers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('private', 'shared')),
  owner_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.ledger_members (
  ledger_id uuid not null references public.ledgers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (ledger_id, user_id)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references public.ledgers(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  occurred_at date not null,
  kind text not null check (kind in ('income', 'expense')),
  amount numeric(14,2) not null check (amount > 0),
  category text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references public.ledgers(id) on delete cascade,
  invited_email text not null check (invited_email = lower(invited_email)),
  invited_user_id uuid references auth.users(id) on delete set null,
  inviter_user_id uuid not null references auth.users(id),
  token text not null unique check (length(token) >= 32),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id)
);

create index if not exists invitations_token_idx on public.invitations (token);
create index if not exists invitations_invited_email_idx on public.invitations (invited_email);
create index if not exists ledger_members_user_id_idx on public.ledger_members (user_id);
create unique index if not exists invitations_unique_pending_idx
  on public.invitations (ledger_id, invited_email)
  where status = 'pending';

-- Membership helpers (security definer + RLS bypass to avoid recursion)
create or replace function public.is_ledger_member(p_ledger_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select (
    exists (
      select 1 from public.ledger_members
      where ledger_id = p_ledger_id
        and user_id = auth.uid()
    )
    or exists (
      select 1 from public.ledgers
      where id = p_ledger_id
        and owner_id = auth.uid()
    )
  );
$$;

create or replace function public.is_ledger_owner(p_ledger_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.ledgers
    where id = p_ledger_id
      and owner_id = auth.uid()
  )
  or exists (
    select 1 from public.ledger_members
    where ledger_id = p_ledger_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.lookup_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

grant execute on function public.is_ledger_member(uuid) to authenticated;
grant execute on function public.is_ledger_owner(uuid) to authenticated;

-- Backfill owners as members (safe for empty DBs)
insert into public.ledger_members (ledger_id, user_id, role, created_at)
select l.id, l.owner_id, 'owner', now()
from public.ledgers l
where l.owner_id is not null
  and not exists (
    select 1 from public.ledger_members m
    where m.ledger_id = l.id and m.user_id = l.owner_id
  );

alter table public.ledgers enable row level security;
alter table public.ledger_members enable row level security;
alter table public.transactions enable row level security;
alter table public.invitations enable row level security;

create policy "Ledgers viewable by members"
  on public.ledgers
  for select
  using (
    owner_id = auth.uid()
    or public.is_ledger_member(id)
  );

create policy "Ledgers insertable by owner"
  on public.ledgers
  for insert
  with check (owner_id = auth.uid());

create policy "Ledgers updatable by owner"
  on public.ledgers
  for update
  using (owner_id = auth.uid());

create policy "Ledgers deletable by owner"
  on public.ledgers
  for delete
  using (owner_id = auth.uid());

create policy "Members can view ledger members"
  on public.ledger_members
  for select
  using (public.is_ledger_member(ledger_id));

create policy "Owners can add ledger members"
  on public.ledger_members
  for insert
  with check (public.is_ledger_owner(ledger_id));

create policy "Owners or self can remove membership"
  on public.ledger_members
  for delete
  using (
    public.is_ledger_owner(ledger_id)
    or user_id = auth.uid()
  );

create policy "Members can view transactions"
  on public.transactions
  for select
  using (public.is_ledger_member(ledger_id));

create policy "Members can insert transactions"
  on public.transactions
  for insert
  with check (
    public.is_ledger_member(ledger_id)
    and created_by = auth.uid()
  );

create policy "Members can update transactions"
  on public.transactions
  for update
  using (public.is_ledger_member(ledger_id))
  with check (public.is_ledger_member(ledger_id));

create policy "Members can delete transactions"
  on public.transactions
  for delete
  using (public.is_ledger_member(ledger_id));

create policy "Members can view invitations"
  on public.invitations
  for select
  using (public.is_ledger_member(ledger_id));

create policy "Owners can create invitations"
  on public.invitations
  for insert
  with check (
    public.is_ledger_owner(ledger_id)
    and (select type from public.ledgers where id = ledger_id) = 'shared'
  );

create policy "Owners can revoke invitations"
  on public.invitations
  for update
  using (public.is_ledger_owner(ledger_id));

revoke select on public.invitations from anon, authenticated;

grant select (
  id,
  ledger_id,
  invited_email,
  invited_user_id,
  inviter_user_id,
  status,
  created_at,
  expires_at,
  accepted_at,
  accepted_by
) on public.invitations to authenticated;

grant insert on public.invitations to authenticated;
grant update on public.invitations to authenticated;

grant select on public.ledgers to authenticated;
grant select on public.ledger_members to authenticated;
grant select on public.transactions to authenticated;

grant insert on public.ledgers, public.ledger_members, public.transactions to authenticated;
grant update, delete on public.ledgers, public.ledger_members, public.transactions to authenticated;

create or replace view public.invitations_safe as
select
  id,
  ledger_id,
  invited_email,
  invited_user_id,
  inviter_user_id,
  status,
  created_at,
  expires_at,
  accepted_at,
  accepted_by,
  case
    when public.is_ledger_owner(ledger_id) or inviter_user_id = auth.uid()
      then token
    else null
  end as token
from public.invitations;

grant select on public.invitations_safe to authenticated;

create or replace function public.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.invitations%rowtype;
  v_email text;
  v_ledger_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_invitation
  from public.invitations
  where token = p_token
  limit 1;

  if not found then
    raise exception 'Invalid invitation token';
  end if;

  v_ledger_id := v_invitation.ledger_id;

  if v_invitation.status = 'revoked' then
    raise exception 'Invitation revoked';
  end if;

  if v_invitation.expires_at < now() then
    update public.invitations
      set status = 'expired'
    where id = v_invitation.id
      and status = 'pending';
    raise exception 'Invitation expired';
  end if;

  v_email := lower((auth.jwt() ->> 'email'));
  if v_email is null or v_email <> v_invitation.invited_email then
    raise exception 'Email does not match invitation';
  end if;

  insert into public.ledger_members (ledger_id, user_id, role)
  values (v_ledger_id, auth.uid(), 'member')
  on conflict do nothing;

  if v_invitation.status = 'pending' then
    update public.invitations
      set status = 'accepted',
          accepted_at = now(),
          accepted_by = auth.uid()
    where id = v_invitation.id
      and status = 'pending';
  end if;

  return v_ledger_id;
end;
$$;

create or replace function public.revoke_invitation(p_invitation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ledger_id uuid;
begin
  select ledger_id into v_ledger_id
  from public.invitations
  where id = p_invitation_id;

  if not found then
    raise exception 'Invitation not found';
  end if;

  if not public.is_ledger_owner(v_ledger_id) then
    raise exception 'Not authorized';
  end if;

  update public.invitations
    set status = 'revoked'
  where id = p_invitation_id
    and status = 'pending';

  return true;
end;
$$;

-- Analytics RPC Functions
create or replace function public.get_ledger_timeseries(
  p_ledger_id uuid,
  p_from date,
  p_to date,
  p_bucket text
)
returns table(
  bucket date,
  income numeric,
  expense numeric,
  net numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bucket_expr text;
begin
  if not public.is_ledger_member(p_ledger_id) then
    raise exception 'Not authorized';
  end if;

  case p_bucket
    when 'daily' then
      v_bucket_expr := 'occurred_at::date';
    when 'weekly' then
      v_bucket_expr := 'date_trunc(''week'', occurred_at)::date';
    when 'monthly' then
      v_bucket_expr := 'date_trunc(''month'', occurred_at)::date';
    else
      raise exception 'Invalid bucket: %', p_bucket;
  end case;

  return query execute format(
    'select
      %s as bucket,
      coalesce(sum(case when kind = ''income'' then amount else 0 end), 0::numeric) as income,
      coalesce(sum(case when kind = ''expense'' then amount else 0 end), 0::numeric) as expense,
      coalesce(sum(case when kind = ''income'' then amount else 0 end), 0::numeric) -
      coalesce(sum(case when kind = ''expense'' then amount else 0 end), 0::numeric) as net
    from public.transactions
    where ledger_id = $1
      and occurred_at between $2 and $3
    group by %s
    order by %s asc',
    v_bucket_expr,
    v_bucket_expr,
    v_bucket_expr
  )
  using p_ledger_id, p_from, p_to;
end;
$$;

create or replace function public.get_ledger_category_breakdown(
  p_ledger_id uuid,
  p_from date,
  p_to date,
  p_kind text default 'expense'
)
returns table(
  category text,
  total numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_ledger_member(p_ledger_id) then
    raise exception 'Not authorized';
  end if;

  return query
  select
    coalesce(nullif(trim(t.category), ''), 'Uncategorized')::text as category,
    round(sum(t.amount), 2)::numeric as total
  from public.transactions t
  where t.ledger_id = p_ledger_id
    and t.occurred_at between p_from and p_to
    and t.kind = p_kind
  group by coalesce(nullif(trim(t.category), ''), 'Uncategorized')
  order by total desc;
end;
$$;

grant execute on function public.get_ledger_timeseries(uuid, date, date, text) to authenticated;
grant execute on function public.get_ledger_category_breakdown(uuid, date, date, text) to authenticated;
