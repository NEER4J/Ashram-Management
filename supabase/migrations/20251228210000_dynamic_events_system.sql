-- Migration: Dynamic Events System
-- Updates temple_events table with slug, is_published, and location
-- Migrates event_registration_analytics from event_name to event_id

-- Add new fields to temple_events table (without unique constraint initially)
alter table temple_events add column if not exists slug text;
alter table temple_events add column if not exists is_published boolean default false;
-- Note: location column removed in later migration (replaced with city/state)

-- Generate slugs for existing events (if any)
-- This will create slugs from event names for existing records
do $$
declare
    event_rec record;
    base_slug text;
    final_slug text;
    counter int;
begin
    for event_rec in select id, name from temple_events where slug is null loop
        -- Generate base slug: lowercase, replace special chars and spaces
        base_slug := lower(regexp_replace(regexp_replace(event_rec.name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
        
        -- Remove leading/trailing hyphens
        base_slug := trim(both '-' from base_slug);
        
        -- Ensure it's not empty
        if base_slug = '' then
            base_slug := 'event-' || substr(event_rec.id::text, 1, 8);
        end if;
        
        -- Check for uniqueness and append number if needed
        final_slug := base_slug;
        counter := 1;
        while exists (select 1 from temple_events where slug = final_slug and id != event_rec.id) loop
            final_slug := base_slug || '-' || counter::text;
            counter := counter + 1;
        end loop;
        
        -- Update the event with the unique slug
        update temple_events set slug = final_slug where id = event_rec.id;
    end loop;
end $$;

-- Now add unique constraint after slugs are populated (if constraint doesn't exist)
do $$
begin
    if not exists (
        select 1 from pg_constraint c
        join pg_class t on c.conrelid = t.oid
        where t.relname = 'temple_events'
        and c.conname = 'temple_events_slug_unique'
    ) then
        alter table temple_events add constraint temple_events_slug_unique unique (slug);
    end if;
end $$;

-- Create index on slug for faster lookups
create index if not exists idx_temple_events_slug on temple_events(slug);

-- Add event_id column to event_registration_analytics (nullable initially for migration)
alter table event_registration_analytics add column if not exists event_id uuid references temple_events(id) on delete cascade;

-- Create index on event_id
create index if not exists idx_event_registration_analytics_event_id on event_registration_analytics(event_id);

-- Migrate existing analytics records that use event_name = 'ayodhya-event'
-- Find or create an event with slug 'ayodhya-event'
insert into temple_events (name, slug, start_date, end_date, status, is_published, location, description)
select 'Ayodhya Event', 'ayodhya-event', current_date, current_date + interval '30 days', 'Planned', true, 'Ayodhya, Uttar Pradesh', 'Ayodhya Event Registration'
where not exists (select 1 from temple_events where slug = 'ayodhya-event');

-- Update existing analytics records to use event_id
update event_registration_analytics
set event_id = (select id from temple_events where slug = 'ayodhya-event' limit 1)
where event_name = 'ayodhya-event' and event_id is null;

-- Now make event_id NOT NULL (after migration)
-- First, drop the old event_name index
drop index if exists idx_event_registration_analytics_event_name;

-- Remove event_name column (after ensuring all data is migrated)
-- We'll do this in a separate step to be safe, but for now keep it for backwards compatibility
-- alter table event_registration_analytics drop column if exists event_name;

-- Update RLS policies for temple_events
-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Allow public read access to published events" on temple_events;
drop policy if exists "Allow authenticated users full access to temple_events" on temple_events;

-- Allow public read access to published events
create policy "Allow public read access to published events"
  on temple_events
  for select
  using (is_published = true);

-- Allow authenticated users full access to temple_events
create policy "Allow authenticated users full access to temple_events"
  on temple_events
  for all
  using (auth.role() = 'authenticated');

-- Update RLS policy for devotees to allow public inserts for any event (not just ayodhya-event)
drop policy if exists "Allow public inserts for event registration" on devotees;
create policy "Allow public inserts for event registration"
  on devotees
  for insert
  with check (event_source is not null);

-- The existing analytics policies should work with event_id
-- Public inserts/updates already allow anonymous access

