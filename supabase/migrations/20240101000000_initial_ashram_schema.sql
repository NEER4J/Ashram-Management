-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Master Tables
-- ==========================================

create table if not exists master_nakshatras (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique
);

create table if not exists master_rashis (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique
);

create table if not exists master_gotras (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique
);

create table if not exists master_donation_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  is_80g_eligible boolean default false,
  is_active boolean default true
);

create table if not exists master_pujas (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null, -- Daily, Special, etc.
  description text,
  base_amount numeric(10, 2) not null default 0,
  duration_minutes integer,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists master_events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text, -- Festival, Cultural
  description text,
  is_active boolean default true
);

-- ==========================================
-- 2. Devotee Management
-- ==========================================

create table if not exists devotees (
  id uuid primary key default uuid_generate_v4(),
  devotee_code text unique, -- Auto-generated DEV-YYYY-####
  first_name text not null,
  middle_name text,
  last_name text,
  email text,
  mobile_number text not null,
  whatsapp_number text,
  gender text check (gender in ('Male', 'Female', 'Other')),
  date_of_birth date,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  country text default 'India',
  pincode text,
  gotra text,
  nakshatra text,
  rashi text,
  membership_type text default 'General', -- General, Life, Patron
  membership_status text default 'Active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists devotee_family_members (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete cascade,
  name text not null,
  relation text not null,
  date_of_birth date,
  mobile_number text,
  is_devotee boolean default false,
  linked_devotee_id uuid references devotees(id)
);

-- ==========================================
-- 3. Staff / Priest Management
-- ==========================================

create table if not exists staff (
  id uuid primary key default uuid_generate_v4(),
  employee_id text unique,
  first_name text not null,
  last_name text,
  role text not null, -- Priest, Admin, Manager
  mobile_number text,
  email text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Specific fields for Priests can be JSONB or columns, keeping simple for now
alter table staff add column if not exists priest_skills text[]; -- Array of puja types they can perform

-- ==========================================
-- 4. Donation Management
-- ==========================================

create table if not exists donations (
  id uuid primary key default uuid_generate_v4(),
  donation_code text unique, -- DON-YYYY-####
  devotee_id uuid references devotees(id),
  donation_date date default current_date,
  amount numeric(12, 2) not null,
  category_id uuid references master_donation_categories(id),
  purpose text,
  payment_mode text not null, -- Cash, UPI, Card
  transaction_ref text, -- UPI ref, Cheque no
  payment_status text default 'Completed',
  receipt_generated boolean default false,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- ==========================================
-- 5. Puja Booking
-- ==========================================

create table if not exists puja_bookings (
  id uuid primary key default uuid_generate_v4(),
  booking_code text unique, -- PUJA-YYYY-####
  devotee_id uuid references devotees(id) not null,
  puja_id uuid references master_pujas(id) not null,
  booking_date date not null,
  puja_date date not null,
  puja_time time,
  assigned_priest_id uuid references staff(id),
  status text default 'Confirmed', -- Confirmed, Completed, Cancelled
  payment_status text default 'Pending',
  amount_paid numeric(10, 2) default 0,
  participant_details jsonb, -- Array of names/nakshatras
  created_at timestamptz default now()
);

-- ==========================================
-- 6. Event Management
-- ==========================================

create table if not exists temple_events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text,
  start_date date not null,
  end_date date not null,
  description text,
  budget numeric(12, 2),
  status text default 'Planned',
  coordinator_id uuid references staff(id),
  created_at timestamptz default now()
);

create table if not exists event_registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references temple_events(id) not null,
  devotee_id uuid references devotees(id) not null,
  registration_date timestamptz default now(),
  number_of_participants integer default 1,
  status text default 'Registered'
);

-- ==========================================
-- 7. Inventory Management
-- ==========================================

create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text, -- Puja Material, Prasad, etc.
  unit text default 'PCS',
  current_stock numeric(10, 2) default 0,
  min_stock_level numeric(10, 2) default 0,
  is_perishable boolean default false,
  created_at timestamptz default now()
);

create table if not exists inventory_transactions (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references inventory_items(id) not null,
  transaction_type text not null, -- IN, OUT
  quantity numeric(10, 2) not null,
  reference_type text, -- Purchase, Puja, Event
  reference_id uuid, -- ID of the related record
  transaction_date timestamptz default now(),
  remarks text
);

-- ==========================================
-- 8. Seed Data (Basic)
-- ==========================================

insert into master_nakshatras (name) values 
('Ashwini'), ('Bharani'), ('Krittika'), ('Rohini'), ('Mrigashirsha'), ('Ardra'), 
('Punarvasu'), ('Pushya'), ('Ashlesha'), ('Magha'), ('Purva Phalguni'), ('Uttara Phalguni'),
('Hasta'), ('Chitra'), ('Swati'), ('Vishakha'), ('Anuradha'), ('Jyeshtha'), ('Mula'),
('Purva Ashadha'), ('Uttara Ashadha'), ('Shravana'), ('Dhanishta'), ('Shatabhisha'),
('Purva Bhadrapada'), ('Uttara Bhadrapada'), ('Revati')
on conflict (name) do nothing;

insert into master_rashis (name) values
('Mesha'), ('Vrishabha'), ('Mithuna'), ('Karka'), ('Simha'), ('Kanya'),
('Tula'), ('Vrishchika'), ('Dhanu'), ('Makara'), ('Kumbha'), ('Meena')
on conflict (name) do nothing;

insert into master_donation_categories (name, description, is_80g_eligible) values
('General Fund', 'General temple maintenance', false),
('Annadanam', 'Food distribution', true),
('Building Fund', 'Construction and repairs', true),
('Pooja Seva', 'Specific pooja sponsorship', false)
on conflict (name) do nothing;

-- ==========================================
-- 9. RLS Policies (Enable RLS for all)
-- ==========================================

alter table devotees enable row level security;
alter table devotee_family_members enable row level security;
alter table staff enable row level security;
alter table donations enable row level security;
alter table puja_bookings enable row level security;
alter table temple_events enable row level security;
alter table event_registrations enable row level security;
alter table inventory_items enable row level security;
alter table inventory_transactions enable row level security;
alter table master_nakshatras enable row level security;
alter table master_rashis enable row level security;
alter table master_gotras enable row level security;
alter table master_donation_categories enable row level security;
alter table master_pujas enable row level security;
alter table master_events enable row level security;

-- Open access for now (Authenticated users can read/write)
-- In production, restrict write access to admins
create policy "Enable all for authenticated users" on devotees for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on devotee_family_members for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on staff for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on donations for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on puja_bookings for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on temple_events for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on event_registrations for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on inventory_items for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on inventory_transactions for all using (auth.role() = 'authenticated');

-- Masters are generally readable by all, writeable by admin
create policy "Public read access" on master_nakshatras for select using (true);
create policy "Public read access" on master_rashis for select using (true);
create policy "Public read access" on master_gotras for select using (true);
create policy "Public read access" on master_donation_categories for select using (true);
create policy "Public read access" on master_pujas for select using (true);
create policy "Public read access" on master_events for select using (true);

