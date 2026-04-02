-- Phase 8: Medical & Healthcare (Doc §9)
create table if not exists medical_camps (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  camp_date date not null,
  location text,
  description text,
  status text default 'Scheduled',
  created_at timestamptz default now()
);

create table if not exists medical_camp_registrations (
  id uuid primary key default uuid_generate_v4(),
  camp_id uuid references medical_camps(id) on delete cascade not null,
  patient_name text not null,
  contact text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists emergency_contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  phone text not null,
  type text check (type in ('ambulance', 'hospital', 'doctor')),
  created_at timestamptz default now()
);

create table if not exists wellness_consultations (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) not null,
  consultation_date date not null,
  practitioner_id uuid references staff(id),
  type text default 'Ayurveda',
  treatment_plan text,
  created_at timestamptz default now()
);

alter table medical_camps enable row level security;
alter table medical_camp_registrations enable row level security;
alter table emergency_contacts enable row level security;
alter table wellness_consultations enable row level security;

create policy "Auth medical_camps" on medical_camps for all using (auth.role() = 'authenticated');
create policy "Auth medical_camp_registrations" on medical_camp_registrations for all using (auth.role() = 'authenticated');
create policy "Auth emergency_contacts" on emergency_contacts for all using (auth.role() = 'authenticated');
create policy "Auth wellness_consultations" on wellness_consultations for all using (auth.role() = 'authenticated');
