-- ==========================================
-- User Profiles & Role Management
-- ==========================================

-- Create user_profiles table to link auth users to devotees
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  devotee_id uuid references devotees(id) on delete set null,
  role text default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add user_id to study_material_orders
alter table study_material_orders 
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Add user_id to course_enrollments
alter table course_enrollments 
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Make devotee_id nullable in enrollments (user might not have devotee linked)
alter table course_enrollments 
  alter column devotee_id drop not null;

-- Update unique constraint to include user_id
alter table course_enrollments 
  drop constraint if exists course_enrollments_course_id_devotee_id_key;

-- Create new unique constraints using partial indexes
-- Allow enrollment by either user_id OR devotee_id (not both required)
create unique index if not exists course_enrollments_course_user_unique 
  on course_enrollments(course_id, user_id) 
  where user_id is not null;

create unique index if not exists course_enrollments_course_devotee_unique 
  on course_enrollments(course_id, devotee_id) 
  where devotee_id is not null and user_id is null;

-- Make devotee_id nullable in orders (user might not have devotee linked)
alter table study_material_orders 
  alter column devotee_id drop not null;

-- Create indexes for performance
create index if not exists idx_user_profiles_devotee on user_profiles(devotee_id);
create index if not exists idx_user_profiles_role on user_profiles(role);
create index if not exists idx_study_material_orders_user on study_material_orders(user_id);
create index if not exists idx_course_enrollments_user on course_enrollments(user_id);

-- Trigger for updated_at
create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row
  execute function update_updated_at_column();

-- Function to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert user profile (this is the critical part)
  insert into public.user_profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing; -- Prevent errors if profile already exists
  
  -- Try to auto-link devotee by email (this is optional, so we catch any errors)
  begin
    update public.user_profiles
    set devotee_id = (
      select id from devotees 
      where email = new.email 
      limit 1
    )
    where id = new.id and devotee_id is null;
  exception when others then
    -- Silently ignore errors in devotee linking
    -- The profile was created successfully, which is what matters
    null;
  end;
  
  return new;
exception when others then
  -- Log the error but don't fail the user creation
  -- This ensures users can still sign up even if profile creation has issues
  raise warning 'Error creating user profile for user %: %', new.id, sqlerrm;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to auto-link devotee by phone (can be called manually)
create or replace function public.link_devotee_by_phone(user_id uuid, phone_number text)
returns boolean as $$
declare
  matched_devotee_id uuid;
begin
  -- Find devotee by phone
  select id into matched_devotee_id
  from devotees
  where mobile_number = phone_number or whatsapp_number = phone_number
  limit 1;
  
  if matched_devotee_id is not null then
    update public.user_profiles
    set devotee_id = matched_devotee_id
    where id = user_id;
    return true;
  end if;
  
  return false;
end;
$$ language plpgsql security definer;

