-- ============================================================
-- Papyrus — Summer Trading Challenge teardown
-- Run this in Supabase SQL Editor to remove the challenge entirely.
-- Reverses challenge.sql and referrals.sql.
--
-- Deletes the contest league rows first (cascades to league_members,
-- league_holdings, and the contest_* tables), then drops the
-- contest-only tables, functions, and columns. The normal weekly
-- game and private leagues are untouched.
-- ============================================================

-- ── Remove contest data ───────────────────────────────────────────
delete from public.leagues where is_contest = true;

-- ── Drop contest-only tables ──────────────────────────────────────
drop table if exists public.contest_snapshots;
drop table if exists public.contest_assets;
drop table if exists public.contest_enrollments;
drop table if exists public.app_admins;

-- ── Drop contest-only functions ───────────────────────────────────
drop function if exists public.enroll_in_contest(uuid, text, text, text, text, text);
drop function if exists public.enroll_in_contest(uuid, text, text, text, text, text, text);
drop function if exists public.create_contest(text, timestamptz, timestamptz, numeric, text);
drop function if exists public.update_contest(uuid, text, timestamptz, timestamptz, numeric, text);
drop function if exists public.get_contest_referral_stats(uuid);
drop function if exists public.generate_referral_code();
drop function if exists public.is_admin();

-- ── Drop contest columns from leagues ─────────────────────────────
alter table public.leagues
  drop column if exists is_contest,
  drop column if exists starts_at,
  drop column if exists prize_description;
