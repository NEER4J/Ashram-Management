-- ==========================================
-- Phase 1: Devotee & CRM + Visitor Management
-- Doc §1: Devotee master extensions, relationship management, visitor management
-- ==========================================

-- 1.1 Devotee master – new columns
alter table devotees add column if not exists emergency_contact_name text;
alter table devotees add column if not exists emergency_contact_phone text;
alter table devotees add column if not exists medical_notes text;
alter table devotees add column if not exists dietary_preferences text; -- vegetarian, vegan, allergies etc
alter table devotees add column if not exists photo_url text;
alter table devotees add column if not exists relationship_status text default 'Active' check (relationship_status in ('Active', 'Inactive', 'Lapsed'));
alter table devotees add column if not exists first_visit_date date;
alter table devotees add column if not exists last_visit_date date;
alter table devotees add column if not exists spiritual_notes text;

-- 1.2 Devotee tags (custom labels)
create table if not exists devotee_tags (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete cascade not null,
  tag_name text not null,
  created_at timestamptz default now(),
  unique(devotee_id, tag_name)
);
create index if not exists idx_devotee_tags_devotee_id on devotee_tags(devotee_id);

-- 1.3 KYC documents
create type kyc_document_type as enum ('Aadhaar', 'PAN', 'Passport');
create table if not exists devotee_kyc_documents (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete cascade not null,
  document_type kyc_document_type not null,
  file_path text not null,
  verified_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_devotee_kyc_devotee_id on devotee_kyc_documents(devotee_id);

-- 1.4 Devotee milestones (birthdays, anniversaries, spiritual)
create type milestone_type as enum ('birthday', 'anniversary', 'spiritual_milestone');
create table if not exists devotee_milestones (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete cascade not null,
  milestone_type milestone_type not null,
  date date not null,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_devotee_milestones_devotee_id on devotee_milestones(devotee_id);

-- 1.5 Relationship management: communications log
create type communication_channel as enum ('call', 'email', 'whatsapp', 'sms');
create type communication_direction as enum ('inbound', 'outbound');
create table if not exists devotee_communications (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete cascade not null,
  channel communication_channel not null,
  direction communication_direction not null,
  summary text,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);
create index if not exists idx_devotee_communications_devotee_id on devotee_communications(devotee_id);

-- 1.6 Devotee notes and follow-up
create table if not exists devotee_notes (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete cascade not null,
  note text not null,
  follow_up_date date,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);
create index if not exists idx_devotee_notes_devotee_id on devotee_notes(devotee_id);
create index if not exists idx_devotee_notes_follow_up on devotee_notes(follow_up_date) where follow_up_date is not null;

-- 1.7 Visitor management
create table if not exists visitor_registrations (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  visit_purpose text,
  visit_date date default current_date,
  check_in_at timestamptz,
  check_out_at timestamptz,
  visitor_pass_code text unique,
  qr_code_url text,
  is_walk_in boolean default true,
  is_vip boolean default false,
  special_arrangements_note text,
  feedback_text text,
  created_at timestamptz default now()
);
create index if not exists idx_visitor_registrations_visit_date on visitor_registrations(visit_date);
create index if not exists idx_visitor_registrations_phone on visitor_registrations(phone);
create index if not exists idx_visitor_registrations_pass_code on visitor_registrations(visitor_pass_code);

-- Generate visitor_pass_code trigger (e.g. V-YYYY-####)
create sequence if not exists visitor_pass_code_seq;

create or replace function generate_visitor_pass_code()
returns trigger as $$
declare
  yr int;
  n int;
begin
  if new.visitor_pass_code is null or new.visitor_pass_code = '' then
    yr := extract(year from current_date);
    n := nextval('visitor_pass_code_seq');
    new.visitor_pass_code := 'V-' || yr || '-' || lpad(n::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_visitor_pass_code on visitor_registrations;
create trigger set_visitor_pass_code
  before insert on visitor_registrations
  for each row execute function generate_visitor_pass_code();

-- RLS for new tables
alter table devotee_tags enable row level security;
alter table devotee_kyc_documents enable row level security;
alter table devotee_milestones enable row level security;
alter table devotee_communications enable row level security;
alter table devotee_notes enable row level security;
alter table visitor_registrations enable row level security;

create policy "Authenticated full access devotee_tags" on devotee_tags for all using (auth.role() = 'authenticated');
create policy "Authenticated full access devotee_kyc_documents" on devotee_kyc_documents for all using (auth.role() = 'authenticated');
create policy "Authenticated full access devotee_milestones" on devotee_milestones for all using (auth.role() = 'authenticated');
create policy "Authenticated full access devotee_communications" on devotee_communications for all using (auth.role() = 'authenticated');
create policy "Authenticated full access devotee_notes" on devotee_notes for all using (auth.role() = 'authenticated');
create policy "Authenticated full access visitor_registrations" on visitor_registrations for all using (auth.role() = 'authenticated');
