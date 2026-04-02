-- ==========================================
-- Phase 2: Accommodation & Guest House (Doc §2)
-- ==========================================

-- 2.1 Rooms and beds
create type room_type_enum as enum ('single', 'double', 'dormitory', 'family_suite');

create table if not exists rooms (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  room_type room_type_enum not null,
  bed_count integer not null default 1,
  amenities jsonb default '{}', -- ac, fan, attached_bathroom, balcony
  building text,
  is_active boolean default true,
  base_price_per_night numeric(10, 2) default 0,
  housekeeping_status text default 'Ready', -- Ready, Cleaning, Maintenance
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists beds (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references rooms(id) on delete cascade not null,
  bed_label text not null,
  is_available boolean default true,
  created_at timestamptz default now(),
  unique(room_id, bed_label)
);
create index if not exists idx_beds_room_id on beds(room_id);

create table if not exists room_maintenance (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references rooms(id) on delete cascade not null,
  scheduled_date date not null,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_room_maintenance_room_id on room_maintenance(room_id);

-- 2.2 Bookings and waitlist
create type booking_status_enum as enum ('Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled');

create table if not exists accommodation_bookings (
  id uuid primary key default uuid_generate_v4(),
  booking_code text unique,
  devotee_id uuid references devotees(id) on delete set null,
  room_id uuid references rooms(id) on delete set null,
  bed_id uuid references beds(id) on delete set null,
  check_in_date date not null,
  check_out_date date not null,
  status booking_status_enum default 'Pending',
  actual_check_in_at timestamptz,
  actual_check_out_at timestamptz,
  special_requests text,
  number_of_guests integer default 1,
  total_amount numeric(12, 2) default 0,
  payment_status text default 'Pending',
  guest_name text,
  guest_phone text,
  guest_email text,
  meal_preference text,
  wake_up_call time,
  laundry_notes text,
  special_assistance text,
  source text default 'admin', -- online, admin
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_accommodation_bookings_dates on accommodation_bookings(check_in_date, check_out_date);
create index if not exists idx_accommodation_bookings_devotee on accommodation_bookings(devotee_id);
create index if not exists idx_accommodation_bookings_status on accommodation_bookings(status);

create sequence if not exists accommodation_booking_code_seq;

create or replace function generate_accommodation_booking_code()
returns trigger as $$
begin
  if new.booking_code is null or new.booking_code = '' then
    new.booking_code := 'ACC-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('accommodation_booking_code_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_accommodation_booking_code on accommodation_bookings;
create trigger set_accommodation_booking_code
  before insert on accommodation_bookings
  for each row execute function generate_accommodation_booking_code();

create table if not exists booking_waitlist (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete cascade,
  guest_name text,
  guest_phone text,
  guest_email text,
  desired_check_in date not null,
  desired_check_out date not null,
  room_type_preference room_type_enum,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_booking_waitlist_dates on booking_waitlist(desired_check_in, desired_check_out);

-- 2.3 Guest feedback
create table if not exists guest_feedback (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references accommodation_bookings(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);
create index if not exists idx_guest_feedback_booking on guest_feedback(booking_id);

-- RLS
alter table rooms enable row level security;
alter table beds enable row level security;
alter table room_maintenance enable row level security;
alter table accommodation_bookings enable row level security;
alter table booking_waitlist enable row level security;
alter table guest_feedback enable row level security;

create policy "Authenticated full access rooms" on rooms for all using (auth.role() = 'authenticated');
create policy "Authenticated full access beds" on beds for all using (auth.role() = 'authenticated');
create policy "Authenticated full access room_maintenance" on room_maintenance for all using (auth.role() = 'authenticated');
create policy "Authenticated full access accommodation_bookings" on accommodation_bookings for all using (auth.role() = 'authenticated');
create policy "Authenticated full access booking_waitlist" on booking_waitlist for all using (auth.role() = 'authenticated');
create policy "Authenticated full access guest_feedback" on guest_feedback for all using (auth.role() = 'authenticated');
