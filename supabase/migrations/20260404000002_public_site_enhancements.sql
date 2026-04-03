-- =============================================================================
-- Public Site Enhancements
-- Adds room images/description, event registration codes, booking payment ref,
-- and user profile spiritual fields (nakshatra, rashi, gotra)
-- =============================================================================

-- 1. Rooms: image & description support
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_url    text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description  text;

-- 2. Event registrations: registration code
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS registration_code text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_code
  ON event_registrations(registration_code)
  WHERE registration_code IS NOT NULL;

-- 3. Accommodation bookings: payment reference (for Razorpay tx ID)
ALTER TABLE accommodation_bookings ADD COLUMN IF NOT EXISTS payment_ref    text;
ALTER TABLE accommodation_bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Pending';

-- 4. User profiles: spiritual fields for puja pre-fill
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS nakshatra text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS rashi     text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gotra     text;

-- 5. Performance indexes
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
