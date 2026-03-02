-- ============================================================
-- Papyrus — Leaderboard SQL
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

-- Allow authenticated users to read all profiles (username + cash_balance only)
-- Needed so the leaderboard can show all users
create policy "Authenticated users can read all profiles"
  on public.profiles for select
  using (auth.uid() is not null);

-- RPC that returns all users' holdings for leaderboard calculation
-- Uses security definer to bypass RLS (only exposes non-sensitive fields)
create or replace function get_leaderboard_holdings()
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
  from public.profiles p
  left join public.holdings h on h.user_id = p.id;
$$;
