-- ============================================================
-- Papyrus — League Duration Migration
-- Run this in Supabase SQL Editor after leagues.sql
-- ============================================================

-- Add duration columns to leagues table
alter table public.leagues
  add column if not exists starting_balance numeric not null default 10000,
  add column if not exists duration_days    int     not null default 7,
  add column if not exists ends_at          timestamptz;

-- Backfill ends_at for existing leagues
update public.leagues
set ends_at = created_at + (duration_days * interval '1 day')
where ends_at is null;

-- ============================================================
-- RPC: create_league — updated with starting_balance + duration
-- ============================================================
create or replace function create_league(
  p_name             text,
  p_starting_balance numeric default 10000,
  p_duration_days    int     default 7
)
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
  if p_starting_balance < 100 then
    return json_build_object('success', false, 'error', 'Starting balance must be at least $100');
  end if;
  if p_duration_days < 1 or p_duration_days > 365 then
    return json_build_object('success', false, 'error', 'Duration must be between 1 and 365 days');
  end if;

  insert into public.leagues (name, owner_id, starting_balance, duration_days, ends_at)
  values (
    trim(p_name),
    v_user_id,
    p_starting_balance,
    p_duration_days,
    now() + (p_duration_days * interval '1 day')
  )
  returning id, invite_code into v_league_id, v_code;

  -- Owner is also a member
  insert into public.league_members (league_id, user_id)
  values (v_league_id, v_user_id);

  return json_build_object('success', true, 'league_id', v_league_id, 'invite_code', v_code);
end;
$$;

-- ============================================================
-- RPC: get_my_leagues — updated to return duration fields
-- ============================================================
drop function if exists get_my_leagues();
create or replace function get_my_leagues()
returns table (
  id               uuid,
  name             text,
  invite_code      text,
  owner_id         uuid,
  is_owner         boolean,
  member_count     bigint,
  starting_balance numeric,
  duration_days    int,
  ends_at          timestamptz,
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
    count(lm2.user_id)        as member_count,
    l.starting_balance,
    l.duration_days,
    l.ends_at,
    l.created_at
  from public.league_members lm
  join public.leagues l on l.id = lm.league_id
  join public.league_members lm2 on lm2.league_id = l.id
  where lm.user_id = auth.uid()
  group by l.id, l.name, l.invite_code, l.owner_id,
           l.starting_balance, l.duration_days, l.ends_at, l.created_at;
$$;
