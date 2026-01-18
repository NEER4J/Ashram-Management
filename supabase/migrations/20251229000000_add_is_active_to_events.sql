-- Migration: Add is_active field to temple_events table
-- This allows events to be deactivated without deleting them

-- Add is_active column to temple_events table
alter table temple_events add column if not exists is_active boolean default true;

-- Update all existing events to be active by default
update temple_events set is_active = true where is_active is null;
