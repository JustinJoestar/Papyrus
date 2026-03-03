-- ============================================================
-- Papyrus — Leagues Update
-- Run this in Supabase SQL Editor AFTER leagues.sql
-- ============================================================

-- 1. Add starting_balance to leagues
alter table public.leagues
  add column if not exists starting_balance numeric not null default 10000;

-- 2. Add league_cash_balance to league_members
--    (each member's cash within this specific league)
alter table public.league_members
  add column if not exists league_cash_balance numeric not null default 10000;

-- 3. League-specific holdings (separate from global portfolio)
create table if not exists public.league_holdings (
  league_id     uuid references public.leagues(id) on delete cascade not null,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  symbol        text not null,
  asset_type    text not null check (asset_type in ('crypto', 'stock', 'commodity')),
  quantity      numeric not null default 0,
  avg_buy_price numeric not null default 0,
  primary key (league_id, user_id, symbol)
);

alter table public.league_holdings enable row level security;

create policy "League members can read league holdings"
  on public.league_holdings for select
  using (
    exists (
      select 1 from public.league_members
      where league_id = league_holdings.league_id
        and user_id = auth.uid()
    )
  );

-- ============================================================
-- Drop functions whose return type changed before recreating
-- ============================================================
drop function if exists create_league(text);
drop function if exists join_league(text);
drop function if exists get_my_leagues();
drop function if exists get_league_leaderboard_holdings(uuid);

-- ============================================================
-- Updated: create_league — now accepts starting_balance
-- ============================================================
create or replace function create_league(p_name text, p_starting_balance numeric default 10000)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id   uuid := auth.uid();
  v_league_id uuid;
  v_code      text;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  if length(trim(p_name)) = 0 then
    return json_build_object('success', false, 'error', 'League name cannot be empty');
  end if;

  if p_starting_balance < 1000 or p_starting_balance > 1000000 then
    return json_build_object('success', false, 'error', 'Starting balance must be between $1,000 and $1,000,000');
  end if;

  insert into public.leagues (name, owner_id, starting_balance)
  values (trim(p_name), v_user_id, p_starting_balance)
  returning id, invite_code into v_league_id, v_code;

  -- Owner is a member with league-specific starting balance
  insert into public.league_members (league_id, user_id, league_cash_balance)
  values (v_league_id, v_user_id, p_starting_balance);

  return json_build_object('success', true, 'league_id', v_league_id, 'invite_code', v_code);
end;
$$;

-- ============================================================
-- Updated: join_league — initializes league_cash_balance
-- ============================================================
create or replace function join_league(p_invite_code text)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id      uuid := auth.uid();
  v_league_id    uuid;
  v_starting_bal numeric;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select id, starting_balance into v_league_id, v_starting_bal
  from public.leagues
  where invite_code = upper(trim(p_invite_code));

  if v_league_id is null then
    return json_build_object('success', false, 'error', 'Invalid invite code');
  end if;

  insert into public.league_members (league_id, user_id, league_cash_balance)
  values (v_league_id, v_user_id, v_starting_bal)
  on conflict (league_id, user_id) do nothing;

  return json_build_object('success', true, 'league_id', v_league_id);
end;
$$;

-- ============================================================
-- Updated: get_my_leagues — includes starting_balance
-- ============================================================
create or replace function get_my_leagues()
returns table (
  id               uuid,
  name             text,
  invite_code      text,
  owner_id         uuid,
  is_owner         boolean,
  member_count     bigint,
  starting_balance numeric,
  created_at       timestamptz
)
language sql
security definer
as $$
  select
    l.id,
    l.name,
    l.invite_code,
    l.owner_id,
    (l.owner_id = auth.uid()) as is_owner,
    count(lm2.user_id)         as member_count,
    l.starting_balance,
    l.created_at
  from public.league_members lm
  join public.leagues l on l.id = lm.league_id
  join public.league_members lm2 on lm2.league_id = l.id
  where lm.user_id = auth.uid()
  group by l.id, l.name, l.invite_code, l.owner_id, l.starting_balance, l.created_at;
$$;

-- ============================================================
-- Updated: get_league_leaderboard_holdings — uses league balance
-- ============================================================
create or replace function get_league_leaderboard_holdings(p_league_id uuid)
returns table (
  user_id      uuid,
  username     text,
  cash_balance numeric,
  symbol       text,
  quantity     numeric,
  asset_type   text
)
language sql
security definer
as $$
  select
    lm.user_id,
    p.username,
    lm.league_cash_balance  as cash_balance,
    lh.symbol,
    lh.quantity,
    lh.asset_type
  from public.league_members lm
  join public.profiles p on p.id = lm.user_id
  left join public.league_holdings lh
    on lh.user_id = lm.user_id and lh.league_id = p_league_id
  where lm.league_id = p_league_id;
$$;

-- ============================================================
-- New: get_league_members — full member list for a league
-- ============================================================
create or replace function get_league_members(p_league_id uuid)
returns table (
  user_id             uuid,
  username            text,
  avatar_url          text,
  is_owner            boolean,
  league_cash_balance numeric,
  joined_at           timestamptz
)
language sql
security definer
as $$
  select
    lm.user_id,
    p.username,
    p.avatar_url,
    (l.owner_id = lm.user_id) as is_owner,
    lm.league_cash_balance,
    lm.joined_at
  from public.league_members lm
  join public.profiles p on p.id = lm.user_id
  join public.leagues l on l.id = p_league_id
  where lm.league_id = p_league_id
    and exists (
      select 1 from public.league_members me
      where me.league_id = p_league_id and me.user_id = auth.uid()
    )
  order by lm.joined_at asc;
$$;

-- ============================================================
-- New: kick_league_member — owner removes a member
-- ============================================================
create or replace function kick_league_member(p_league_id uuid, p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_caller uuid := auth.uid();
  v_owner  uuid;
begin
  select owner_id into v_owner
  from public.leagues
  where id = p_league_id;

  if v_owner is null then
    return json_build_object('success', false, 'error', 'League not found');
  end if;

  if v_caller != v_owner then
    return json_build_object('success', false, 'error', 'Only the owner can kick members');
  end if;

  if p_user_id = v_owner then
    return json_build_object('success', false, 'error', 'Cannot kick the owner');
  end if;

  delete from public.league_holdings
  where league_id = p_league_id and user_id = p_user_id;

  delete from public.league_members
  where league_id = p_league_id and user_id = p_user_id;

  return json_build_object('success', true);
end;
$$;
