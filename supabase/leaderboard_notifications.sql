-- ============================================================
-- Papyrus — Leaderboard rank notifications
-- Run this in Supabase SQL Editor after achievements.sql
-- ============================================================

-- check_leaderboard_notification: called after every global trade.
-- Uses buy-price × quantity as a fast portfolio proxy (no external price API needed).
-- Milestones are idempotent — each fires only once (stored as hidden achievements).
-- Leaderboard rank notifications also re-fire via direct INSERT to keep users updated
-- while still respecting a 1-hour cooldown so they don't spam.
-- ============================================================

create or replace function public.check_leaderboard_notification()
returns json
language plpgsql
security definer
as $$
declare
  v_user_id     uuid := auth.uid();
  v_rank        bigint;
  v_total_users bigint;
  v_already_top10 boolean;
  v_already_top3  boolean;
  v_already_rank1 boolean;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Compute approximate rank using avg_price × quantity as portfolio proxy.
  -- (No external price calls — fast and always available.)
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

  -- ── Milestone achievements (idempotent, show on achievements page) ──────

  -- Tie "Top 10" achievement into the leaderboard check
  if v_rank <= 10 then
    perform public.award_achievement(
      v_user_id,
      'top_10',
      '🏆 Top 10 on the Leaderboard',
      'You''ve entered the global top 10. Keep climbing.'
    );
  end if;

  -- ── Rank-specific one-time notifications (not shown as achievements) ────
  -- These use a 2-hour cooldown so users can be re-notified if they dip and climb back.

  -- Check cooldown for each tier
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
