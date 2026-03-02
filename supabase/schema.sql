-- ============================================================
-- Papyrus — Supabase Database Schema
-- Run this in your Supabase project: SQL Editor > New Query
-- ============================================================

-- Profiles table (one row per user)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  cash_balance numeric(12, 2) not null default 10000.00,
  created_at timestamptz not null default now(),
  last_reset_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can only read and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Holdings table (what assets a user currently holds)
-- ============================================================
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,         -- e.g. 'BTC', 'ETH', 'AAPL'
  asset_type text not null,     -- 'crypto' | 'stock' | 'commodity'
  quantity numeric(18, 8) not null default 0,
  avg_buy_price numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, symbol)
);

alter table public.holdings enable row level security;

create policy "Users can manage own holdings"
  on public.holdings for all
  using (auth.uid() = user_id);

-- ============================================================
-- Transactions table (full history of buys/sells)
-- ============================================================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  asset_type text not null,
  type text not null check (type in ('buy', 'sell')),
  quantity numeric(18, 8) not null,
  price_at_trade numeric(12, 2) not null,
  total_value numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);
