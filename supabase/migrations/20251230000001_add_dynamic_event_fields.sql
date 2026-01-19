-- Migration: Add Dynamic Fields to temple_events
-- Adds fields for dynamic content: hero images, social links, WhatsApp details, contact info

-- Add hero_image_url column for uploaded hero images
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Add subtitle column (separate from description)
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- Add social media URL columns
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add WhatsApp fields
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS whatsapp_message TEXT;

-- Add contact phone field
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- All fields are nullable to maintain backward compatibility with existing events
