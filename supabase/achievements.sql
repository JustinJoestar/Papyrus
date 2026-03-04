-- ============================================================
-- Papyrus — Achievements & Notifications
-- Run this in Supabase SQL Editor after trading.sql
-- ============================================================

-- user_achievements: one row per achievement earned per user
create table if not exists public.user_achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade not null,
  achievement_id text not null,
  unlocked_at    timestamptz not null default now(),
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Users can view own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

-- ============================================================
-- Notifications table
-- ============================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  type       text not null default 'info',  -- 'achievement' | 'info' | 'reset' | 'league'
  title      text not null,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Enable realtime so the bell updates instantly
alter publication supabase_realtime add table public.notifications;

-- ============================================================
-- award_achievement: idempotent — only inserts + notifies once
-- ============================================================
create or replace function public.award_achievement(
  p_user_id        uuid,
  p_achievement_id text,
  p_title          text,
  p_body           text
)
returns boolean
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from public.user_achievements
    where user_id = p_user_id and achievement_id = p_achievement_id
  ) then
    insert into public.user_achievements (user_id, achievement_id)
    values (p_user_id, p_achievement_id);

    insert into public.notifications (user_id, type, title, body)
    values (p_user_id, 'achievement', p_title, p_body);

    return true;
  end if;

  return false;
end;
$$;

-- ============================================================
-- check_trade_achievements: called after every buy/sell
-- Checks: first_trade, ten_trades, diversified
-- ============================================================
create or replace function public.check_trade_achievements()
returns json
language plpgsql
security definer
as $$
declare
  v_user_id     uuid := auth.uid();
  v_trade_count bigint;
  v_asset_types text[];
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Total global trades
  select count(*) into v_trade_count
  from public.transactions where user_id = v_user_id;

  if v_trade_count >= 1 then
    perform public.award_achievement(
      v_user_id,
      'first_trade',
      '🚀 First Trade',
      'You completed your first trade. The journey begins!'
    );
  end if;

  if v_trade_count >= 10 then
    perform public.award_achievement(
      v_user_id,
      'ten_trades',
      '📈 10 Trades',
      'You''ve completed 10 total transactions. Keep it up!'
    );
  end if;

  -- Diversified: currently holds all 3 asset types
  select array_agg(distinct asset_type) into v_asset_types
  from public.holdings
  where user_id = v_user_id and quantity > 0;

  if v_asset_types @> array['crypto', 'stock', 'commodity'] then
    perform public.award_achievement(
      v_user_id,
      'diversified',
      '🌐 Diversified',
      'You''re holding crypto, stocks, and a commodity simultaneously!'
    );
  end if;

  return json_build_object('success', true);
end;
$$;
