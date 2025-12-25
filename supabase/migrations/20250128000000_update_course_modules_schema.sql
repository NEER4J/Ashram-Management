-- ==========================================
-- Update course_modules to make content_type nullable
-- ==========================================
-- Since modules are now containers and lessons contain the actual content,
-- content_type, content_url, and duration_minutes are no longer needed at module level

-- Make content_type nullable
alter table course_modules
  alter column content_type drop not null;

-- Add default value for content_type
alter table course_modules
  alter column content_type set default null;

-- Add is_active column if it doesn't exist
alter table course_modules
  add column if not exists is_active boolean default true;

