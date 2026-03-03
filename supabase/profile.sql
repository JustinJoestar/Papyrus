-- ============================================================
-- Papyrus — Profile RPCs
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

-- RPC: get_email_by_username — used by the login page to sign in by username
create or replace function get_email_by_username(p_username text)
returns text
language sql
security definer
as $$
  select au.email
  from auth.users au
  join public.profiles p on p.id = au.id
  where lower(p.username) = lower(trim(p_username))
  limit 1;
$$;

-- RPC: update_username — change username with uniqueness check
create or replace function update_username(p_username text)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_clean   text := trim(p_username);
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  if length(v_clean) < 3 then
    return json_build_object('success', false, 'error', 'Username must be at least 3 characters');
  end if;

  if length(v_clean) > 20 then
    return json_build_object('success', false, 'error', 'Username must be 20 characters or less');
  end if;

  if v_clean !~ '^[a-zA-Z0-9_]+$' then
    return json_build_object('success', false, 'error', 'Username can only contain letters, numbers, and underscores');
  end if;

  -- Check if taken by someone else
  if exists (
    select 1 from public.profiles
    where lower(username) = lower(v_clean)
      and id <> v_user_id
  ) then
    return json_build_object('success', false, 'error', 'Username is already taken');
  end if;

  update public.profiles
  set username = v_clean
  where id = v_user_id;

  return json_build_object('success', true);
end;
$$;

-- ============================================================
-- Storage: avatars bucket
-- Run these separately in Supabase SQL Editor (Storage section)
-- OR create manually: Storage > New bucket > "avatars" > Public
-- ============================================================

-- insert into storage.buckets (id, name, public)
-- values ('avatars', 'avatars', true)
-- on conflict (id) do nothing;

-- create policy "Users can upload own avatar"
--   on storage.objects for insert
--   with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- create policy "Users can update own avatar"
--   on storage.objects for update
--   using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- create policy "Anyone can read avatars"
--   on storage.objects for select
--   using (bucket_id = 'avatars');
