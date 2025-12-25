-- ==========================================
-- Fix user_profiles trigger and RLS
-- ==========================================

-- First, ensure RLS policies are in place
alter table user_profiles enable row level security;

-- Drop and recreate the trigger function with better error handling
drop trigger if exists on_auth_user_created on auth.users;

-- Recreate the function with improved error handling
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert user profile - this is critical and must succeed
  -- Use on conflict to prevent duplicate key errors
  insert into public.user_profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do update set role = 'user';
  
  -- Try to auto-link devotee by email (optional, wrapped in exception handler)
  begin
    update public.user_profiles
    set devotee_id = (
      select id from devotees 
      where email = new.email 
      and email is not null
      limit 1
    )
    where id = new.id and devotee_id is null;
  exception when others then
    -- Ignore errors in devotee linking - profile creation is what matters
    null;
  end;
  
  return new;
exception when others then
  -- If something goes wrong, log it but don't fail user creation
  -- This is critical - we don't want to block user signups
  raise warning 'Error in handle_new_user for user %: %', new.id, sqlerrm;
  return new; -- Always return new to allow user creation to proceed
end;
$$ language plpgsql security definer;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Ensure RLS policies allow the trigger to work
-- Drop existing policies
drop policy if exists "Users can view their own profile" on user_profiles;
drop policy if exists "Users can update their own profile" on user_profiles;
drop policy if exists "Allow profile creation" on user_profiles;

-- Policy: Users can view their own profile
create policy "Users can view their own profile"
on user_profiles
for select
using (auth.uid() = id);

-- Policy: Users can update their own profile  
create policy "Users can update their own profile"
on user_profiles
for update
using (auth.uid() = id);

-- Policy: Allow profile creation (needed for trigger)
-- The security definer function should bypass RLS, but this ensures it works
create policy "Allow profile creation"
on user_profiles
for insert
with check (true);

