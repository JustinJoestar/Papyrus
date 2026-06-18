-- ============================================================
-- Papyrus Summer Trading Challenge — schema
-- Run AFTER leagues.sql, leagues_update.sql, leagues_duration.sql,
-- trading_server_price.sql
--
-- The contest is a special league row (is_contest = true): it reuses
-- league_members (cash), league_holdings (positions) and the secured
-- execute_league_trade engine. perform_weekly_reset() only touches the
-- GLOBAL profiles/holdings, so the contest is already exempt from the
-- weekly reset with no extra work.
--
-- This migration adds: contest config columns, an admin allowlist,
-- enrollment metadata, the tradeable universe whitelist, and the daily
-- portfolio snapshots that the Sortino + Comeback awards are computed
-- from (snapshots MUST be recorded from day one — they cannot be
-- backfilled).
-- ============================================================

-- ── Contest config on the leagues row ─────────────────────────────
alter table public.leagues
  add column if not exists is_contest        boolean not null default false,
  add column if not exists starts_at         timestamptz,
  add column if not exists prize_description  text;

-- ── Admin allowlist ───────────────────────────────────────────────
create table if not exists public.app_admins (
  email text primary key
);
-- Seed your admin email once:
--   insert into public.app_admins (email) values ('you@example.com');

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.app_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ── Enrollment metadata (one row per participant) ─────────────────
create table if not exists public.contest_enrollments (
  league_id    uuid references public.leagues(id)  on delete cascade not null,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  full_name    text not null,
  parent_email text,          -- optional (allowed: participants are 13+)
  school       text,
  grade        text,
  heard_from   text,
  enrolled_at  timestamptz not null default now(),
  primary key (league_id, user_id)
);

alter table public.contest_enrollments enable row level security;

create policy "Users read own enrollment"
  on public.contest_enrollments for select
  using (auth.uid() = user_id);

-- ── Tradeable universe whitelist ──────────────────────────────────
create table if not exists public.contest_assets (
  league_id  uuid references public.leagues(id) on delete cascade not null,
  symbol     text not null,
  asset_type text not null default 'stock' check (asset_type in ('stock')), -- ETFs price like stocks
  name       text,
  primary key (league_id, symbol)
);

alter table public.contest_assets enable row level security;

-- Universe is public info (shown on the rules page, pre-login).
create policy "Anyone can read contest universe"
  on public.contest_assets for select
  using (true);

-- ── Daily portfolio snapshots (for Sortino + Comeback) ────────────
create table if not exists public.contest_snapshots (
  id            uuid primary key default gen_random_uuid(),
  league_id     uuid references public.leagues(id)  on delete cascade not null,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  snapshot_date date not null,
  total_value   numeric(14, 2) not null,
  created_at    timestamptz not null default now(),
  unique (league_id, user_id, snapshot_date)
);

alter table public.contest_snapshots enable row level security;

create policy "Users read own snapshots"
  on public.contest_snapshots for select
  using (auth.uid() = user_id);
-- Snapshots are written by the daily cron via the service role (bypasses RLS).

-- ============================================================
-- RPC: enroll_in_contest — join the contest + capture metadata
-- ============================================================
create or replace function public.enroll_in_contest(
  p_league_id    uuid,
  p_full_name    text,
  p_parent_email text default null,
  p_school       text default null,
  p_grade        text default null,
  p_heard_from   text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_contest record;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  if length(trim(coalesce(p_full_name, ''))) < 2 then
    return json_build_object('success', false, 'error', 'Please enter your full name');
  end if;

  select id, is_contest, ends_at, starting_balance
    into v_contest
  from public.leagues
  where id = p_league_id;

  if v_contest.id is null or not v_contest.is_contest then
    return json_build_object('success', false, 'error', 'Contest not found');
  end if;

  if v_contest.ends_at is not null and now() > v_contest.ends_at then
    return json_build_object('success', false, 'error', 'Enrollment has closed');
  end if;

  -- Join as a league member with the contest starting balance (idempotent)
  insert into public.league_members (league_id, user_id, league_cash_balance)
  values (p_league_id, v_user_id, v_contest.starting_balance)
  on conflict (league_id, user_id) do nothing;

  -- Upsert enrollment metadata
  insert into public.contest_enrollments
    (league_id, user_id, full_name, parent_email, school, grade, heard_from)
  values (
    p_league_id, v_user_id,
    trim(p_full_name),
    nullif(trim(coalesce(p_parent_email, '')), ''),
    nullif(trim(coalesce(p_school, '')), ''),
    nullif(trim(coalesce(p_grade, '')), ''),
    nullif(trim(coalesce(p_heard_from, '')), '')
  )
  on conflict (league_id, user_id) do update set
    full_name    = excluded.full_name,
    parent_email = excluded.parent_email,
    school       = excluded.school,
    grade        = excluded.grade,
    heard_from   = excluded.heard_from;

  return json_build_object('success', true);
end;
$$;

-- ============================================================
-- RPC: create_contest — admin creates/configures the pilot contest
-- ============================================================
create or replace function public.create_contest(
  p_name             text,
  p_starts_at        timestamptz,
  p_ends_at          timestamptz,
  p_starting_balance numeric,
  p_prize            text
)
returns json
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    return json_build_object('success', false, 'error', 'Not authorized');
  end if;

  insert into public.leagues
    (name, owner_id, starting_balance, starts_at, ends_at, is_contest, prize_description)
  values
    (trim(p_name), auth.uid(), p_starting_balance, p_starts_at, p_ends_at, true, p_prize)
  returning id into v_id;
  -- NB: admin is the owner but is NOT added as a member, so they don't
  -- appear on the participant leaderboard.

  return json_build_object('success', true, 'league_id', v_id);
end;
$$;
