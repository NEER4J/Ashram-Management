-- ==========================================
-- Phase 3: Events & Programs full spec (Doc §3)
-- Venues, capacity, recurrence, certificates, waitlist, stream
-- ==========================================

-- Venues
create table if not exists venues (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  capacity integer,
  location text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Add event planning columns to temple_events (if not exist from prior migrations)
alter table temple_events add column if not exists venue_id uuid references venues(id) on delete set null;
alter table temple_events add column if not exists capacity integer;
alter table temple_events add column if not exists recurrence_rule text; -- json or text: daily/weekly/monthly
alter table temple_events add column if not exists recurrence_end_date date;
alter table temple_events add column if not exists speaker_facilitator_id uuid references staff(id) on delete set null;
alter table temple_events add column if not exists resource_plan text;
alter table temple_events add column if not exists budget numeric(12, 2);
alter table temple_events add column if not exists stream_url text;
alter table temple_events add column if not exists stream_embed text;

-- Event materials (optional)
create table if not exists event_materials (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references temple_events(id) on delete cascade not null,
  name text not null,
  type text,
  url_or_path text,
  created_at timestamptz default now()
);
create index if not exists idx_event_materials_event_id on event_materials(event_id);

-- Registration: fee and certificate
alter table event_registrations add column if not exists fee_paid numeric(10, 2) default 0;
alter table event_registrations add column if not exists certificate_issued_at timestamptz;

-- Waitlist (event_registration_waitlist uses event_id and devotee_id; volunteers table comes in Phase 5 so we use devotee_id for now)
create table if not exists event_registration_waitlist (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references temple_events(id) on delete cascade not null,
  devotee_id uuid references devotees(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(event_id, devotee_id)
);
create index if not exists idx_event_registration_waitlist_event on event_registration_waitlist(event_id);

-- Festival volunteer assignments (volunteer_id will reference volunteers table from Phase 5; add column after Phase 5 or use devotee_id for now)
create table if not exists event_volunteer_assignments (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references temple_events(id) on delete cascade not null,
  devotee_id uuid references devotees(id) on delete cascade, -- can use volunteer_id later
  role text,
  slot text,
  created_at timestamptz default now()
);
create index if not exists idx_event_volunteer_assignments_event on event_volunteer_assignments(event_id);

-- RLS
alter table venues enable row level security;
alter table event_materials enable row level security;
alter table event_registration_waitlist enable row level security;
alter table event_volunteer_assignments enable row level security;

create policy "Authenticated full access venues" on venues for all using (auth.role() = 'authenticated');
create policy "Public read venues" on venues for select using (true);
create policy "Authenticated full access event_materials" on event_materials for all using (auth.role() = 'authenticated');
create policy "Authenticated full access event_registration_waitlist" on event_registration_waitlist for all using (auth.role() = 'authenticated');
create policy "Authenticated full access event_volunteer_assignments" on event_volunteer_assignments for all using (auth.role() = 'authenticated');
