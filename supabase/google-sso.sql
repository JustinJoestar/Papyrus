-- Run this in Supabase SQL Editor after enabling Google OAuth provider.
-- Updates handle_new_user to safely generate usernames for Google SSO users
-- (who don't supply a username) without hitting the unique constraint.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  counter        int := 0;
begin
  -- Prefer explicit username (email/password signup), then Google display name, then email prefix
  base_username := coalesce(
    new.raw_user_meta_data->>'username',
    regexp_replace(
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      '[^a-zA-Z0-9_]', '', 'g'
    )
  );

  -- Ensure minimum length
  if length(base_username) < 3 then
    base_username := base_username || 'trader';
  end if;

  -- Truncate to leave room for numeric suffix
  base_username  := left(base_username, 15);
  final_username := base_username;

  -- Resolve any collision
  while exists (select 1 from public.profiles where username = final_username) loop
    counter        := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into public.profiles (id, username)
  values (new.id, final_username);

  return new;
end;
$$ language plpgsql security definer;
