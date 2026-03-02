-- ============================================================
-- Papyrus — Weekly Reset SQL
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

-- Table to archive each week's final leaderboard before reset
create table if not exists public.weekly_snapshots (
  id          uuid primary key default gen_random_uuid(),
  week_end    timestamptz not null default now(),
  username    text not null,
  final_value numeric(12, 2) not null,
  rank        int not null
);

alter table public.weekly_snapshots enable row level security;

-- Authenticated users can read past snapshots (for "last week" display)
create policy "Authenticated users can read snapshots"
  on public.weekly_snapshots for select
  using (auth.uid() is not null);

-- ============================================================
-- RPC to reset all portfolios (called from the /api/reset route)
-- Snapshots are inserted by the API route (needs live prices)
-- ============================================================
create or replace function perform_weekly_reset()
returns void
language plpgsql
security definer
as $$
begin
  -- Reset every user's cash balance to $10,000
  update public.profiles
  set cash_balance  = 10000.00,
      last_reset_at = now();

  -- Wipe all holdings
  delete from public.holdings;
end;
$$;
