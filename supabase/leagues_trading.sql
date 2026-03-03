-- ============================================================
-- Papyrus — League Trading
-- Run this in Supabase SQL Editor after leagues_update.sql
-- ============================================================

-- ============================================================
-- get_my_league_balances — lightweight helper for the switcher
-- Returns the calling user's leagues with their current cash
-- ============================================================
create or replace function get_my_league_balances()
returns table (
  league_id    uuid,
  league_name  text,
  cash_balance numeric
)
language sql
security definer
as $$
  select
    l.id   as league_id,
    l.name as league_name,
    lm.league_cash_balance as cash_balance
  from public.league_members lm
  join public.leagues l on l.id = lm.league_id
  where lm.user_id = auth.uid()
  order by l.created_at asc;
$$;

-- ============================================================
-- execute_league_trade — buy/sell within a league portfolio
-- Uses league_cash_balance + league_holdings (not global)
-- ============================================================
create or replace function execute_league_trade(
  p_league_id  uuid,
  p_symbol     text,
  p_asset_type text,
  p_type       text,     -- 'buy' or 'sell'
  p_quantity   numeric,
  p_price      numeric
)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id  uuid    := auth.uid();
  v_cash_bal numeric;
  v_total    numeric := p_quantity * p_price;
  v_held_qty numeric;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  if p_quantity <= 0 or p_price <= 0 then
    return json_build_object('success', false, 'error', 'Invalid quantity or price');
  end if;

  -- Get caller's league cash balance (also verifies membership)
  select league_cash_balance into v_cash_bal
  from public.league_members
  where league_id = p_league_id and user_id = v_user_id;

  if not found then
    return json_build_object('success', false, 'error', 'Not a member of this league');
  end if;

  if p_type = 'buy' then
    if v_cash_bal < v_total then
      return json_build_object('success', false, 'error', 'Insufficient league balance');
    end if;

    -- Deduct cash
    update public.league_members
    set league_cash_balance = league_cash_balance - v_total
    where league_id = p_league_id and user_id = v_user_id;

    -- Upsert holding (weighted avg price)
    insert into public.league_holdings (league_id, user_id, symbol, asset_type, quantity, avg_buy_price)
    values (p_league_id, v_user_id, p_symbol, p_asset_type, p_quantity, p_price)
    on conflict (league_id, user_id, symbol) do update
      set avg_buy_price = (
            league_holdings.avg_buy_price * league_holdings.quantity + p_price * p_quantity
          ) / (league_holdings.quantity + p_quantity),
          quantity = league_holdings.quantity + p_quantity;

  elsif p_type = 'sell' then
    select quantity into v_held_qty
    from public.league_holdings
    where league_id = p_league_id and user_id = v_user_id and symbol = p_symbol;

    if v_held_qty is null or v_held_qty < p_quantity then
      return json_build_object('success', false, 'error', 'Insufficient holdings in this league');
    end if;

    -- Add cash back
    update public.league_members
    set league_cash_balance = league_cash_balance + v_total
    where league_id = p_league_id and user_id = v_user_id;

    -- Remove or reduce holding
    if abs(v_held_qty - p_quantity) < 0.000001 then
      delete from public.league_holdings
      where league_id = p_league_id and user_id = v_user_id and symbol = p_symbol;
    else
      update public.league_holdings
      set quantity = quantity - p_quantity
      where league_id = p_league_id and user_id = v_user_id and symbol = p_symbol;
    end if;

  else
    return json_build_object('success', false, 'error', 'Invalid trade type');
  end if;

  return json_build_object('success', true);
end;
$$;
