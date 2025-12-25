-- ==========================================
-- RLS Policies for user_profiles
-- ==========================================

-- Enable RLS on user_profiles if not already enabled
alter table user_profiles enable row level security;

-- Drop existing policies if they exist (to allow re-running)
drop policy if exists "Users can view their own profile" on user_profiles;
drop policy if exists "Users can update their own profile" on user_profiles;
drop policy if exists "Allow profile creation" on user_profiles;
drop policy if exists "Allow trigger to manage profiles" on user_profiles;

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

-- Policy: Allow inserts (for trigger function and new signups)
-- This allows the trigger function to insert new profiles
create policy "Allow profile creation"
on user_profiles
for insert
with check (true);

-- Note: The trigger function uses security definer, which should bypass RLS.
-- However, in some Supabase configurations, explicit policies are still needed.
-- The "Allow profile creation" policy above should be sufficient for inserts.
-- For updates (devotee linking), the trigger function runs with security definer
-- privileges, so it should bypass RLS. If issues persist, we may need to add
-- a more permissive update policy, but let's try with just the insert policy first.

-- Note: The trigger function `handle_new_user()` uses `security definer`
-- which means it runs with the privileges of the function owner (usually postgres/service role),
-- so it should bypass RLS. However, if RLS is enabled without any policies,
-- it will block all operations. The policies above ensure that:
-- 1. Users can read/update their own profiles
-- 2. The trigger can insert new profiles (via the "Allow profile creation" policy)

