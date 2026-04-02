-- ==========================================
-- Phase 5: Seva & Volunteer management (Doc §5)
-- ==========================================

create table if not exists volunteers (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete cascade not null unique,
  joined_at date default current_date,
  skills text[],
  interests text[],
  category text check (category in ('Regular', 'Occasional', 'Retired', 'Youth')),
  availability jsonb default '{}',
  background_verified_at date,
  training_certifications text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_volunteers_devotee on volunteers(devotee_id);

create table if not exists seva_opportunities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  description text,
  location text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists seva_shifts (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references seva_opportunities(id) on delete cascade not null,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  slots_needed integer default 1,
  created_at timestamptz default now()
);
create index if not exists idx_seva_shifts_opportunity on seva_shifts(opportunity_id);

create table if not exists seva_assignments (
  id uuid primary key default uuid_generate_v4(),
  shift_id uuid references seva_shifts(id) on delete cascade not null,
  volunteer_id uuid references volunteers(id) on delete cascade not null,
  status text default 'Assigned' check (status in ('Assigned', 'Completed', 'NoShow')),
  hours_actual numeric(5, 2),
  created_at timestamptz default now(),
  unique(shift_id, volunteer_id)
);
create index if not exists idx_seva_assignments_shift on seva_assignments(shift_id);
create index if not exists idx_seva_assignments_volunteer on seva_assignments(volunteer_id);

create table if not exists volunteer_badges (
  id uuid primary key default uuid_generate_v4(),
  volunteer_id uuid references volunteers(id) on delete cascade not null,
  badge_type text not null,
  awarded_at timestamptz default now()
);
create index if not exists idx_volunteer_badges_volunteer on volunteer_badges(volunteer_id);

alter table volunteers enable row level security;
alter table seva_opportunities enable row level security;
alter table seva_shifts enable row level security;
alter table seva_assignments enable row level security;
alter table volunteer_badges enable row level security;

create policy "Authenticated full access volunteers" on volunteers for all using (auth.role() = 'authenticated');
create policy "Authenticated full access seva_opportunities" on seva_opportunities for all using (auth.role() = 'authenticated');
create policy "Authenticated full access seva_shifts" on seva_shifts for all using (auth.role() = 'authenticated');
create policy "Authenticated full access seva_assignments" on seva_assignments for all using (auth.role() = 'authenticated');
create policy "Authenticated full access volunteer_badges" on volunteer_badges for all using (auth.role() = 'authenticated');
