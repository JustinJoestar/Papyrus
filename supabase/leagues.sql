-- ============================================================
-- Papyrus — Leagues SQL
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

-- Leagues table
create table public.leagues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  owner_id    uuid references public.profiles(id) on delete cascade not null,
  created_at  timestamptz not null default now()
);

-- League members join table
create table public.league_members (
  league_id  uuid references public.leagues(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  joined_at  timestamptz not null default now(),
  primary key (league_id, user_id)
);

alter table public.leagues enable row level security;
alter table public.league_members enable row level security;

-- Any authenticated user can read leagues (needed to resolve invite codes)
create policy "Authenticated users can read leagues"
  on public.leagues for select
  using (auth.uid() is not null);

-- Only owner can delete their league
create policy "Owner can delete league"
  on public.leagues for delete
  using (auth.uid() = owner_id);

-- Users can read their own memberships
create policy "Users can read own memberships"
  on public.league_members for select
  using (auth.uid() = user_id);

-- Users can remove their own membership (leave)
create policy "Users can delete own membership"
  on public.league_members for delete
  using (auth.uid() = user_id);

-- ============================================================
-- RPC: create_league — create a league and add creator as member
-- ============================================================
create or replace function create_league(p_name text)
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

  insert into public.leagues (name, owner_id)
  values (trim(p_name), v_user_id)
  returning id, invite_code into v_league_id, v_code;

  -- Owner is also a member
  insert into public.league_members (league_id, user_id)
  values (v_league_id, v_user_id);

  return json_build_object('success', true, 'league_id', v_league_id, 'invite_code', v_code);
end;
$$;

-- ============================================================
-- RPC: join_league — join a league by invite code
-- ============================================================
create or replace function join_league(p_invite_code text)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id   uuid := auth.uid();
  v_league_id uuid;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select id into v_league_id
  from public.leagues
  where invite_code = upper(trim(p_invite_code));

  if v_league_id is null then
    return json_build_object('success', false, 'error', 'Invalid invite code');
  end if;

  insert into public.league_members (league_id, user_id)
  values (v_league_id, v_user_id)
  on conflict (league_id, user_id) do nothing;

  return json_build_object('success', true, 'league_id', v_league_id);
end;
$$;

-- ============================================================
-- RPC: get_my_leagues — leagues the current user belongs to
-- ============================================================
create or replace function get_my_leagues()
returns table (
  id           uuid,
  name         text,
  invite_code  text,
  owner_id     uuid,
  is_owner     boolean,
  member_count bigint,
  created_at   timestamptz
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
    count(lm2.user_id)        as member_count,
    l.created_at
  from public.league_members lm
  join public.leagues l on l.id = lm.league_id
  join public.league_members lm2 on lm2.league_id = l.id
  where lm.user_id = auth.uid()
  group by l.id, l.name, l.invite_code, l.owner_id, l.created_at;
$$;

-- ============================================================
-- RPC: get_league_leaderboard_holdings — holdings for league members only
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
    p.id        as user_id,
    p.username,
    p.cash_balance,
    h.symbol,
    h.quantity,
    h.asset_type
  from public.league_members lm
  join public.profiles p on p.id = lm.user_id
  left join public.holdings h on h.user_id = lm.user_id
  where lm.league_id = p_league_id;
$$;
