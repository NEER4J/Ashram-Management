-- =============================================================================
-- Public User Revamp
-- Adds 'devotee' role, profile fields, user_id links, and public RLS policies
-- =============================================================================

-- 1. Add 'devotee' role to user_profiles
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('admin', 'user', 'devotee'));

-- 2. Add profile fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone       text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url  text;

-- 3. Update handle_new_user trigger: respect role + display_name + phone from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role, display_name, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  BEGIN
    UPDATE public.user_profiles
    SET devotee_id = (SELECT id FROM devotees WHERE email = new.email LIMIT 1)
    WHERE id = new.id AND devotee_id IS NULL;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating user profile for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Add user_id + relax NOT NULL on transactional tables

-- event_registrations
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS user_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_mode   text DEFAULT 'free';
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_ref    text;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE event_registrations ALTER COLUMN devotee_id DROP NOT NULL;

-- accommodation_bookings
ALTER TABLE accommodation_bookings ADD COLUMN IF NOT EXISTS user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE accommodation_bookings ADD COLUMN IF NOT EXISTS payment_mode text DEFAULT 'pay_at_ashram';

-- donations
ALTER TABLE donations ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- puja_bookings
ALTER TABLE puja_bookings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE puja_bookings ALTER COLUMN devotee_id DROP NOT NULL;

-- volunteers: add user_id, phone, email, name, seva_interest, status; relax devotee_id
ALTER TABLE volunteers DROP CONSTRAINT IF EXISTS volunteers_devotee_id_key;
ALTER TABLE volunteers ALTER COLUMN devotee_id DROP NOT NULL;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS name              text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS email             text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS phone             text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS seva_interest     text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS availability_notes text;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS status            text DEFAULT 'pending'
  CHECK (status IN ('pending', 'active', 'inactive'));

-- 5. Event registration fields on temple_events
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS registration_fee      numeric(10,2) DEFAULT 0;
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS is_registration_open  boolean DEFAULT true;
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS max_registrations     integer;

-- 6. Performance indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_user     ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_accommodation_bookings_user  ON accommodation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_user               ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_puja_bookings_user           ON puja_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_user              ON volunteers(user_id);

-- 7. Public (anon) read policies for browseable entities

-- seva_opportunities
DROP POLICY IF EXISTS "Public read seva_opportunities" ON seva_opportunities;
CREATE POLICY "Public read seva_opportunities" ON seva_opportunities
  FOR SELECT USING (is_active = true);

-- master_pujas
DROP POLICY IF EXISTS "Public read master_pujas" ON master_pujas;
CREATE POLICY "Public read master_pujas" ON master_pujas
  FOR SELECT USING (is_active = true);

-- master_donation_categories
DROP POLICY IF EXISTS "Public read master_donation_categories" ON master_donation_categories;
CREATE POLICY "Public read master_donation_categories" ON master_donation_categories
  FOR SELECT USING (is_active = true);

-- 8. Devotee self-access read policies
DROP POLICY IF EXISTS "devotees_view_own_registrations" ON event_registrations;
CREATE POLICY "devotees_view_own_registrations" ON event_registrations
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "devotees_view_own_bookings" ON accommodation_bookings;
CREATE POLICY "devotees_view_own_bookings" ON accommodation_bookings
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "devotees_view_own_donations" ON donations;
CREATE POLICY "devotees_view_own_donations" ON donations
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "devotees_view_own_pujas" ON puja_bookings;
CREATE POLICY "devotees_view_own_pujas" ON puja_bookings
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "devotees_view_own_enrollments" ON course_enrollments;
CREATE POLICY "devotees_view_own_enrollments" ON course_enrollments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "devotees_view_own_orders" ON study_material_orders;
CREATE POLICY "devotees_view_own_orders" ON study_material_orders
  FOR SELECT USING (user_id = auth.uid());

-- user_profiles: devotees read/update own
DROP POLICY IF EXISTS "devotees_read_own_profile" ON user_profiles;
CREATE POLICY "devotees_read_own_profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "devotees_update_own_profile" ON user_profiles;
CREATE POLICY "devotees_update_own_profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());
