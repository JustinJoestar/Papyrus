-- ============================================================
-- Papyrus — Server-authoritative trading
-- Run this AFTER trading.sql and leagues_trading.sql
--
-- WHY: the old execute_trade / execute_league_trade accepted the
-- price as a client-supplied parameter and were callable directly by
-- any authenticated user. A user could call them from the browser
-- console with an arbitrary price (e.g. buy BTC at $0.01) and mint
-- unlimited cash, destroying leaderboard integrity.
--
-- THIS MIGRATION:
--   1. Drops the old client-callable signatures.
--   2. Recreates both functions taking an explicit p_user_id instead
--      of auth.uid().
--   3. Revokes EXECUTE from anon/authenticated so the browser can no
--      longer call them at all — only the service role (used by the
--      /api/trade server route, which fetches the real price) can.
-- ============================================================

-- ── Drop the old, exploitable signatures ──────────────────────────
drop function if exists public.execute_trade(text, text, text, numeric, numeric);
drop function if exists public.execute_league_trade(uuid, text, text, text, numeric, numeric);

-- ── Global trade (server-only) ────────────────────────────────────
create or replace function public.execute_trade(
  p_user_id    uuid,
  p_symbol     text,
  p_asset_type text,
  p_type       text,      -- 'buy' or 'sell'
  p_quantity   numeric,
  p_price      numeric
)
returns json
language plpgsql
security definer
as $$
declare
  v_total       numeric := round(p_quantity * p_price, 2);
  v_balance     numeric;
  v_holding_qty numeric;
begin
  if p_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  if p_quantity <= 0 or p_price <= 0 then
    return json_build_object('success', false, 'error', 'Invalid quantity or price');
  end if;

  if p_type = 'buy' then
    select cash_balance into v_balance
    from public.profiles where id = p_user_id;

    if v_balance < v_total then
      return json_build_object('success', false, 'error', 'Insufficient balance');
    end if;

    update public.profiles
    set cash_balance = cash_balance - v_total
    where id = p_user_id;

    insert into public.holdings (user_id, symbol, asset_type, quantity, avg_buy_price)
    values (p_user_id, upper(p_symbol), p_asset_type, p_quantity, p_price)
    on conflict (user_id, symbol) do update set
      avg_buy_price = (holdings.avg_buy_price * holdings.quantity + p_price * p_quantity)
                      / (holdings.quantity + p_quantity),
      quantity      = holdings.quantity + p_quantity,
      updated_at    = now();

  elsif p_type = 'sell' then
    select quantity into v_holding_qty
    from public.holdings
    where user_id = p_user_id and symbol = upper(p_symbol);

    if v_holding_qty is null or v_holding_qty < p_quantity then
      return json_build_object('success', false, 'error', 'Insufficient holdings');
    end if;

    update public.profiles
    set cash_balance = cash_balance + v_total
    where id = p_user_id;

    if v_holding_qty - p_quantity < 0.000001 then
      delete from public.holdings
      where user_id = p_user_id and symbol = upper(p_symbol);
    else
      update public.holdings
      set quantity   = quantity - p_quantity,
          updated_at = now()
      where user_id = p_user_id and symbol = upper(p_symbol);
    end if;

  else
    return json_build_object('success', false, 'error', 'Invalid trade type');
  end if;

  insert into public.transactions (user_id, symbol, asset_type, type, quantity, price_at_trade, total_value)
  values (p_user_id, upper(p_symbol), p_asset_type, p_type, p_quantity, p_price, v_total);

  return json_build_object('success', true);
end;
$$;

-- ── League trade (server-only) ────────────────────────────────────
create or replace function public.execute_league_trade(
  p_user_id    uuid,
  p_league_id  uuid,
  p_symbol     text,
  p_asset_type text,
  p_type       text,      -- 'buy' or 'sell'
  p_quantity   numeric,
  p_price      numeric
)
returns json
language plpgsql
security definer
as $$
declare
  v_cash_bal numeric;
  v_total    numeric := round(p_quantity * p_price, 2);
  v_held_qty numeric;
begin
  if p_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  if p_quantity <= 0 or p_price <= 0 then
    return json_build_object('success', false, 'error', 'Invalid quantity or price');
  end if;

  select league_cash_balance into v_cash_bal
  from public.league_members
  where league_id = p_league_id and user_id = p_user_id;

  if not found then
    return json_build_object('success', false, 'error', 'Not a member of this league');
  end if;

  if p_type = 'buy' then
    if v_cash_bal < v_total then
      return json_build_object('success', false, 'error', 'Insufficient league balance');
    end if;

    update public.league_members
    set league_cash_balance = league_cash_balance - v_total
    where league_id = p_league_id and user_id = p_user_id;

    insert into public.league_holdings (league_id, user_id, symbol, asset_type, quantity, avg_buy_price)
    values (p_league_id, p_user_id, upper(p_symbol), p_asset_type, p_quantity, p_price)
    on conflict (league_id, user_id, symbol) do update
      set avg_buy_price = (
            league_holdings.avg_buy_price * league_holdings.quantity + p_price * p_quantity
          ) / (league_holdings.quantity + p_quantity),
          quantity = league_holdings.quantity + p_quantity;

  elsif p_type = 'sell' then
    select quantity into v_held_qty
    from public.league_holdings
    where league_id = p_league_id and user_id = p_user_id and symbol = upper(p_symbol);

    if v_held_qty is null or v_held_qty < p_quantity then
      return json_build_object('success', false, 'error', 'Insufficient holdings in this league');
    end if;

    update public.league_members
    set league_cash_balance = league_cash_balance + v_total
    where league_id = p_league_id and user_id = p_user_id;

    if abs(v_held_qty - p_quantity) < 0.000001 then
      delete from public.league_holdings
      where league_id = p_league_id and user_id = p_user_id and symbol = upper(p_symbol);
    else
      update public.league_holdings
      set quantity = quantity - p_quantity
      where league_id = p_league_id and user_id = p_user_id and symbol = upper(p_symbol);
    end if;

  else
    return json_build_object('success', false, 'error', 'Invalid trade type');
  end if;

  return json_build_object('success', true);
end;
$$;

-- ── Lock down: only the service role (server route) may execute ───
revoke all on function public.execute_trade(uuid, text, text, text, numeric, numeric)        from public, anon, authenticated;
revoke all on function public.execute_league_trade(uuid, uuid, text, text, text, numeric, numeric) from public, anon, authenticated;

grant execute on function public.execute_trade(uuid, text, text, text, numeric, numeric)        to service_role;
grant execute on function public.execute_league_trade(uuid, uuid, text, text, text, numeric, numeric) to service_role;
