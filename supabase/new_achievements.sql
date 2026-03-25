-- ============================================================
-- Papyrus — Additional achievement checks
-- Run this in Supabase SQL Editor after achievements.sql
-- Adds: hundred_trades, day_trader, diamond_hands, weekly_reset,
--       comeback, top_3 (awarded via check_leaderboard_notification)
-- ============================================================

-- ============================================================
-- Update check_trade_achievements to include new milestones
-- ============================================================
create or replace function public.check_trade_achievements()
returns json
language plpgsql
security definer
as $$
declare
  v_user_id        uuid := auth.uid();
  v_trade_count    bigint;
  v_day_count      bigint;
  v_asset_types    text[];
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Total global trades
  select count(*) into v_trade_count
  from public.transactions where user_id = v_user_id;

  -- ── Milestone: first trade ────────────────────────────────────────────────
  if v_trade_count >= 1 then
    perform public.award_achievement(
      v_user_id,
      'first_trade',
      '🚀 The First Move',
      'Executed your first trade. The market is now your battleground.'
    );
  end if;

  -- ── Milestone: 10 trades ─────────────────────────────────────────────────
  if v_trade_count >= 10 then
    perform public.award_achievement(
      v_user_id,
      'ten_trades',
      '📈 Momentum',
      '10 trades completed. You''re building rhythm in the market.'
    );
  end if;

  -- ── Milestone: 100 trades (Centurion) ────────────────────────────────────
  if v_trade_count >= 100 then
    perform public.award_achievement(
      v_user_id,
      'hundred_trades',
      '🔥 Centurion',
      '100 total trades. You don''t visit the market — you live here.'
    );
  end if;

  -- ── Day trader: 5+ trades within the last 24 hours (The Blitz) ───────────
  select count(*) into v_day_count
  from public.transactions
  where user_id = v_user_id
    and created_at > now() - interval '24 hours';

  if v_day_count >= 5 then
    perform public.award_achievement(
      v_user_id,
      'day_trader',
      '⚡ The Blitz',
      '5 trades in a single day. Speed is your sharpest edge.'
    );
  end if;

  -- ── Diversified: holds all 3 asset types simultaneously ──────────────────
  select array_agg(distinct asset_type) into v_asset_types
  from public.holdings
  where user_id = v_user_id and quantity > 0;

  if v_asset_types @> array['crypto', 'stock', 'commodity'] then
    perform public.award_achievement(
      v_user_id,
      'diversified',
      '🌐 All Markets',
      'Crypto, stocks, and a commodity — held simultaneously. Spread thin, never broke.'
    );
  end if;

  -- ── Diamond hands: oldest active holding is at least 7 days old ──────────
  if exists (
    select 1 from public.holdings
    where user_id = v_user_id
      and quantity > 0
      and updated_at <= now() - interval '7 days'
  ) then
    perform public.award_achievement(
      v_user_id,
      'diamond_hands',
      '💎 Iron Grip',
      'Held a position for a full week without flinching. The market tested you — you held.'
    );
  end if;

  return json_build_object('success', true);
end;
$$;

-- ============================================================
-- check_weekly_achievements: call this from the weekly reset job
-- Awards: weekly_reset (Battle-Hardened) after 4 resets
-- ============================================================
create or replace function public.check_weekly_achievements(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_reset_count bigint;
begin
  -- Count how many weekly resets this user has been through
  -- (approximated by counting distinct ISO weeks with at least one transaction)
  select count(distinct date_trunc('week', created_at))
    into v_reset_count
  from public.transactions
  where user_id = p_user_id;

  if v_reset_count >= 4 then
    perform public.award_achievement(
      p_user_id,
      'weekly_reset',
      '🛡️ Battle-Hardened',
      'Survived 4 weekly resets. Every phase of the market — and you kept going.'
    );
  end if;
end;
$$;

-- ============================================================
-- Update check_leaderboard_notification to also award top_3
-- ============================================================
create or replace function public.check_leaderboard_notification()
returns json
language plpgsql
security definer
as $$
declare
  v_user_id       uuid := auth.uid();
  v_rank          bigint;
  v_total_users   bigint;
  v_already_rank1 boolean;
  v_already_top3  boolean;
  v_already_top10 boolean;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Compute approximate rank using avg_price × quantity as portfolio proxy.
  select rank_val, total_count
    into v_rank, v_total_users
  from (
    select
      p.id,
      rank() over (
        order by (p.cash_balance + coalesce(sum(h.quantity * h.avg_buy_price), 0)) desc
      ) as rank_val,
      count(*) over () as total_count
    from public.profiles p
    left join public.holdings h
      on h.user_id = p.id and h.quantity > 0
    group by p.id, p.cash_balance
  ) ranked
  where id = v_user_id;

  if v_rank is null then
    return json_build_object('success', false, 'error', 'Could not compute rank');
  end if;

  -- ── Milestone achievements (idempotent) ──────────────────────────────────

  if v_rank <= 10 then
    perform public.award_achievement(
      v_user_id,
      'top_10',
      '🏆 The Elite Ten',
      'Reached the global top 10. You are in rarified air.'
    );
  end if;

  if v_rank <= 3 then
    perform public.award_achievement(
      v_user_id,
      'top_3',
      '🥈 The Podium',
      'Global top 3. The crowd has turned to watch you.'
    );
  end if;

  -- ── Rank-specific notifications (2-hour cooldown) ────────────────────────

  select exists (
    select 1 from public.notifications
    where user_id = v_user_id
      and type = 'leaderboard'
      and title like '%#1%'
      and created_at > now() - interval '2 hours'
  ) into v_already_rank1;

  select exists (
    select 1 from public.notifications
    where user_id = v_user_id
      and type = 'leaderboard'
      and title like '%Top 3%'
      and created_at > now() - interval '2 hours'
  ) into v_already_top3;

  select exists (
    select 1 from public.notifications
    where user_id = v_user_id
      and type = 'leaderboard'
      and title like '%Top 10%'
      and created_at > now() - interval '2 hours'
  ) into v_already_top10;

  if v_rank = 1 and not v_already_rank1 then
    insert into public.notifications (user_id, type, title, body)
    values (
      v_user_id,
      'leaderboard',
      '🥇 Rank #1 — You''re on top!',
      'You hold the #1 spot on the global leaderboard right now.'
    );

  elsif v_rank <= 3 and not v_already_top3 then
    insert into public.notifications (user_id, type, title, body)
    values (
      v_user_id,
      'leaderboard',
      '🥈 Top 3 on the Leaderboard',
      'You''ve broken into the global top 3. You''re elite.'
    );

  elsif v_rank <= 10 and not v_already_top10 then
    insert into public.notifications (user_id, type, title, body)
    values (
      v_user_id,
      'leaderboard',
      '🏆 Top 10 on the Leaderboard',
      'You''ve entered the global top 10 — ' || v_rank || ' of ' || v_total_users || ' traders.'
    );
  end if;

  return json_build_object('success', true, 'rank', v_rank, 'total', v_total_users);
end;
$$;

-- ============================================================
-- comeback achievement: check_comeback_achievement
-- Called manually or scheduled — checks if the user's portfolio
-- dropped ≥20% then recovered to positive within a week.
-- Requires a portfolio_snapshots table or similar history.
-- For now, awards if the user has ever had a net-positive weekly
-- PnL after having been negative during the same week.
-- ============================================================
-- NOTE: The comeback (Phoenix) achievement requires historical
-- portfolio value snapshots to detect a -20% drawdown and recovery.
-- Implement via a daily cron that stores portfolio value, then
-- compare weekly low vs week-end value to trigger award_achievement.
-- Example stub:
--
-- create or replace function public.check_comeback_achievement(p_user_id uuid)
-- returns void language plpgsql security definer as $$
-- begin
--   -- Query daily portfolio snapshots for current week
--   -- If min_value <= week_start_value * 0.80 AND current_value > week_start_value:
--   --   perform public.award_achievement(p_user_id, 'comeback', '✨ Phoenix', '...');
-- end;
-- $$;
