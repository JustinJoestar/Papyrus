-- ============================================================
-- Papyrus Summer Trading Challenge — referral system
-- Run AFTER challenge.sql
--
-- Every enrolled participant gets a unique 6-char share code.
-- A new entrant may submit someone's code at enrollment; the link is
-- validated and locked in server-side at insert time (no self-referrals,
-- immutable afterwards), so the count can't be gamed from the client.
-- The referral leaderboard ranks participants by how many entrants
-- they brought in.
-- ============================================================

-- ── Columns on contest_enrollments ────────────────────────────────
alter table public.contest_enrollments
  add column if not exists referral_code text,
  add column if not exists referred_by   uuid references public.profiles(id) on delete set null;

-- Codes are unique within a contest; lookups by referrer stay cheap.
create unique index if not exists contest_enrollments_referral_code_key
  on public.contest_enrollments (league_id, referral_code);
create index if not exists contest_enrollments_referred_by_idx
  on public.contest_enrollments (league_id, referred_by);

-- ── Code generator ─────────────────────────────────────────────────
-- 6 chars from an unambiguous alphabet (no 0/O, 1/I/L) → ~887M combos.
create or replace function public.generate_referral_code()
returns text
language sql
volatile
as $$
  select string_agg(
    substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (floor(random() * 31) + 1)::int, 1),
    ''
  )
  from generate_series(1, 6);
$$;

-- ── Backfill codes for anyone already enrolled ─────────────────────
do $$
declare
  r record;
begin
  for r in
    select league_id, user_id from public.contest_enrollments
    where referral_code is null
  loop
    loop
      begin
        update public.contest_enrollments
        set referral_code = public.generate_referral_code()
        where league_id = r.league_id and user_id = r.user_id;
        exit;
      exception when unique_violation then
        -- rare collision: retry with a fresh code
      end;
    end loop;
  end loop;
end $$;

-- ============================================================
-- RPC: enroll_in_contest — now accepts an optional referral code.
-- Replaces the 6-arg version (dropped so PostgREST doesn't see an
-- ambiguous overload).
-- ============================================================
drop function if exists public.enroll_in_contest(uuid, text, text, text, text, text);

create or replace function public.enroll_in_contest(
  p_league_id     uuid,
  p_full_name     text,
  p_parent_email  text default null,
  p_school        text default null,
  p_grade         text default null,
  p_heard_from    text default null,
  p_referral_code text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id  uuid := auth.uid();
  v_contest  record;
  v_new      boolean;
  v_referrer uuid;
  v_ref_code text := upper(trim(coalesce(p_referral_code, '')));
  v_code     text;
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

  -- A referral only counts on a FIRST enrollment — re-submitting the
  -- form can update your details but never change who referred you.
  v_new := not exists (
    select 1 from public.contest_enrollments
    where league_id = p_league_id and user_id = v_user_id
  );

  if v_new and v_ref_code <> '' then
    select user_id into v_referrer
    from public.contest_enrollments
    where league_id = p_league_id and referral_code = v_ref_code;

    if v_referrer is null then
      return json_build_object('success', false, 'error',
        'That referral code isn''t valid — double-check it or leave it blank');
    end if;
    if v_referrer = v_user_id then
      return json_build_object('success', false, 'error',
        'You can''t use your own referral code');
    end if;
  end if;

  -- Join as a league member with the contest starting balance (idempotent)
  insert into public.league_members (league_id, user_id, league_cash_balance)
  values (p_league_id, v_user_id, v_contest.starting_balance)
  on conflict (league_id, user_id) do nothing;

  -- Upsert enrollment metadata (referred_by is set on insert only)
  insert into public.contest_enrollments
    (league_id, user_id, full_name, parent_email, school, grade, heard_from, referred_by)
  values (
    p_league_id, v_user_id,
    trim(p_full_name),
    nullif(trim(coalesce(p_parent_email, '')), ''),
    nullif(trim(coalesce(p_school, '')), ''),
    nullif(trim(coalesce(p_grade, '')), ''),
    nullif(trim(coalesce(p_heard_from, '')), ''),
    v_referrer
  )
  on conflict (league_id, user_id) do update set
    full_name    = excluded.full_name,
    parent_email = excluded.parent_email,
    school       = excluded.school,
    grade        = excluded.grade,
    heard_from   = excluded.heard_from;

  -- Give the participant their own share code (kept if already assigned)
  loop
    select referral_code into v_code
    from public.contest_enrollments
    where league_id = p_league_id and user_id = v_user_id;
    exit when v_code is not null;
    begin
      update public.contest_enrollments
      set referral_code = public.generate_referral_code()
      where league_id = p_league_id and user_id = v_user_id and referral_code is null;
    exception when unique_violation then
      -- rare collision: retry with a fresh code
    end;
  end loop;

  return json_build_object('success', true, 'referral_code', v_code);
end;
$$;

-- ============================================================
-- RPC: get_contest_referral_stats — own code + how many joined with it.
-- Security definer because counting referred rows requires reading
-- other participants' enrollments, which RLS (rightly) blocks.
-- ============================================================
create or replace function public.get_contest_referral_stats(p_league_id uuid)
returns json
language plpgsql
stable
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_code    text;
  v_count   integer;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  select referral_code into v_code
  from public.contest_enrollments
  where league_id = p_league_id and user_id = v_user_id;

  if v_code is null then
    return json_build_object('success', false, 'error', 'Not enrolled');
  end if;

  select count(*) into v_count
  from public.contest_enrollments
  where league_id = p_league_id and referred_by = v_user_id;

  return json_build_object('success', true, 'code', v_code, 'count', v_count);
end;
$$;
