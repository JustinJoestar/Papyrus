-- ============================================================
-- Papyrus — Fix create_league: creator gets correct starting balance
-- Run this in Supabase SQL Editor after leagues_duration.sql
-- ============================================================

-- Add duration columns if not already present (idempotent)
alter table public.leagues
  add column if not exists duration_days int not null default 7,
  add column if not exists ends_at       timestamptz;

-- Backfill ends_at for existing leagues that are missing it
update public.leagues
set ends_at = created_at + (duration_days * interval '1 day')
where ends_at is null;

-- ============================================================
-- Fixed create_league:
--   - sets league_cash_balance for the creator (was missing)
--   - includes duration_days + ends_at
-- ============================================================
drop function if exists create_league(text, numeric, int);
drop function if exists create_league(text, numeric);
drop function if exists create_league(text);

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

  -- Creator gets the correct league starting balance (not global $10k default)
  insert into public.league_members (league_id, user_id, league_cash_balance)
  values (v_league_id, v_user_id, p_starting_balance);

  return json_build_object('success', true, 'league_id', v_league_id, 'invite_code', v_code);
end;
$$;
