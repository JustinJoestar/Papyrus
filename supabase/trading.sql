-- ============================================================
-- Papyrus — Trading RPC Function
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

create or replace function execute_trade(
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
  v_user_id    uuid    := auth.uid();
  v_total      numeric := round(p_quantity * p_price, 2);
  v_balance    numeric;
  v_holding_qty numeric;
begin
  -- Must be authenticated
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Basic validation
  if p_quantity <= 0 or p_price <= 0 then
    return json_build_object('success', false, 'error', 'Invalid quantity or price');
  end if;

  if p_type = 'buy' then
    -- Check cash balance
    select cash_balance into v_balance
    from public.profiles where id = v_user_id;

    if v_balance < v_total then
      return json_build_object('success', false, 'error', 'Insufficient balance');
    end if;

    -- Deduct cash
    update public.profiles
    set cash_balance = cash_balance - v_total
    where id = v_user_id;

    -- Add to holdings (or update avg price if already held)
    insert into public.holdings (user_id, symbol, asset_type, quantity, avg_buy_price)
    values (v_user_id, upper(p_symbol), p_asset_type, p_quantity, p_price)
    on conflict (user_id, symbol) do update set
      avg_buy_price = (holdings.avg_buy_price * holdings.quantity + p_price * p_quantity)
                      / (holdings.quantity + p_quantity),
      quantity      = holdings.quantity + p_quantity,
      updated_at    = now();

  elsif p_type = 'sell' then
    -- Check holding quantity
    select quantity into v_holding_qty
    from public.holdings
    where user_id = v_user_id and symbol = upper(p_symbol);

    if v_holding_qty is null or v_holding_qty < p_quantity then
      return json_build_object('success', false, 'error', 'Insufficient holdings');
    end if;

    -- Add cash back
    update public.profiles
    set cash_balance = cash_balance + v_total
    where id = v_user_id;

    -- Remove or reduce holding
    if v_holding_qty - p_quantity < 0.000001 then
      delete from public.holdings
      where user_id = v_user_id and symbol = upper(p_symbol);
    else
      update public.holdings
      set quantity   = quantity - p_quantity,
          updated_at = now()
      where user_id = v_user_id and symbol = upper(p_symbol);
    end if;

  else
    return json_build_object('success', false, 'error', 'Invalid trade type');
  end if;

  -- Log transaction
  insert into public.transactions (user_id, symbol, asset_type, type, quantity, price_at_trade, total_value)
  values (v_user_id, upper(p_symbol), p_asset_type, p_type, p_quantity, p_price, v_total);

  return json_build_object('success', true);
end;
$$;
