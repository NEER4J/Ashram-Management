-- ==========================================
-- Hotel-style accommodation: multiple properties
-- ==========================================

-- 1. Accommodations (properties) table
create table if not exists accommodations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  address text,
  phone text,
  email text,
  check_in_time time default '14:00',
  check_out_time time default '11:00',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table accommodations enable row level security;
create policy "Authenticated full access accommodations" on accommodations for all using (auth.role() = 'authenticated');
create policy "Anon read active accommodations" on accommodations for select to anon using (is_active = true);

-- 2. Add accommodation_id to rooms (nullable first for backfill)
alter table rooms add column if not exists accommodation_id uuid references accommodations(id) on delete restrict;
create index if not exists idx_rooms_accommodation_id on rooms(accommodation_id);

-- 3. Insert default accommodation and backfill rooms
insert into accommodations (id, name, code, is_active)
select gen_random_uuid(), 'Main Guest House', 'MAIN', true
where not exists (select 1 from accommodations limit 1);

update rooms set accommodation_id = (select id from accommodations where code = 'MAIN' limit 1)
where accommodation_id is null;

-- 4. Enforce unique room code per accommodation and NOT NULL
alter table rooms alter column accommodation_id set not null;
alter table rooms drop constraint if exists rooms_code_key;
create unique index idx_rooms_accommodation_code on rooms(accommodation_id, code);

-- 5. booking_waitlist: add accommodation_id (nullable)
alter table booking_waitlist add column if not exists accommodation_id uuid references accommodations(id) on delete set null;
create index if not exists idx_booking_waitlist_accommodation_id on booking_waitlist(accommodation_id);

-- 6. accommodation_bookings: add accommodation_id, set from room
alter table accommodation_bookings add column if not exists accommodation_id uuid references accommodations(id) on delete set null;
create index if not exists idx_accommodation_bookings_accommodation_id on accommodation_bookings(accommodation_id);

-- Backfill accommodation_id on existing bookings from room
update accommodation_bookings ab
set accommodation_id = r.accommodation_id
from rooms r
where ab.room_id = r.id and ab.accommodation_id is null;

-- Trigger: set accommodation_id on insert/update from room
create or replace function set_booking_accommodation_id()
returns trigger as $$
begin
  if new.room_id is not null then
    select accommodation_id into new.accommodation_id from rooms where id = new.room_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_booking_accommodation_id_trigger on accommodation_bookings;
create trigger set_booking_accommodation_id_trigger
  before insert or update of room_id on accommodation_bookings
  for each row execute function set_booking_accommodation_id();
