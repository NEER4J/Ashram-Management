-- =============================================================================
-- Module Enhancements Migration
-- Adds new tables, columns, triggers, and sequences for:
--   1. Kitchen & Prasad (token auto-code, status constraints)
--   2. Visitors (new columns: group_id, vehicle, nationality, department)
--   3. Inventory (PO auto-code, PO line items, transfer status)
--   4. Staff (attendance, departments, expanded columns)
--   5. Medical (first aid incidents, camp enhancements, wellness status)
--   6. In-Kind Donations (expanded fields, receipt auto-code)
--   7. Multi-currency support across relevant tables
-- =============================================================================

-- ===========================
-- 1. KITCHEN & PRASAD
-- ===========================

-- Meal token auto-code
create sequence if not exists meal_token_code_seq;

create or replace function generate_meal_token_code()
returns trigger as $$
begin
  if new.token_code is null or new.token_code = '' then
    new.token_code := 'MT-' || to_char(new.meal_date, 'YYYY-MMDD') || '-' || lpad(nextval('meal_token_code_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_meal_token_code on meal_tokens;
create trigger set_meal_token_code
  before insert on meal_tokens
  for each row execute function generate_meal_token_code();

-- Add status check constraint to prasad_bookings (if not already constrained)
do $$ begin
  alter table prasad_bookings add constraint prasad_bookings_status_check
    check (status in ('Pending', 'Confirmed', 'Prepared', 'Distributed', 'Cancelled'));
exception when duplicate_object then null;
end $$;

-- Add currency to annadaan_donations
alter table annadaan_donations add column if not exists currency text default 'INR';

-- ===========================
-- 2. VISITORS
-- ===========================

alter table visitor_registrations add column if not exists group_id uuid;
alter table visitor_registrations add column if not exists vehicle_number text;
alter table visitor_registrations add column if not exists nationality text;
alter table visitor_registrations add column if not exists visiting_department text;

-- Index on group_id for group lookups
create index if not exists idx_visitor_registrations_group on visitor_registrations(group_id);

-- ===========================
-- 3. INVENTORY
-- ===========================

-- PO number auto-generation
create sequence if not exists purchase_order_code_seq;

create or replace function generate_po_number()
returns trigger as $$
begin
  if new.po_number is null or new.po_number = '' then
    new.po_number := 'PO-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('purchase_order_code_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_po_number on purchase_orders;
create trigger set_po_number
  before insert on purchase_orders
  for each row execute function generate_po_number();

-- Add status check constraint to purchase_orders
do $$ begin
  alter table purchase_orders add constraint purchase_orders_status_check
    check (status in ('Draft', 'Submitted', 'Approved', 'Received', 'Cancelled'));
exception when duplicate_object then null;
end $$;

-- Add total_amount to purchase_orders
alter table purchase_orders add column if not exists total_amount numeric(12, 2) default 0;
alter table purchase_orders add column if not exists notes text;

-- PO line items table
create table if not exists purchase_order_items (
  id uuid primary key default uuid_generate_v4(),
  po_id uuid references purchase_orders(id) on delete cascade not null,
  item_id uuid references inventory_items(id) on delete set null,
  item_name text not null,
  quantity numeric(10, 2) not null default 1,
  unit_cost numeric(12, 2) default 0,
  total_cost numeric(12, 2) default 0,
  created_at timestamptz default now()
);
create index if not exists idx_po_items_po on purchase_order_items(po_id);

alter table purchase_order_items enable row level security;
do $$ begin
  create policy "Authenticated users can manage purchase_order_items" on purchase_order_items
    for all using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

-- Add status to inventory_transfers
alter table inventory_transfers add column if not exists status text default 'Completed';
alter table inventory_transfers add column if not exists notes text;

-- Add more fields to inventory_locations
alter table inventory_locations add column if not exists description text;

-- ===========================
-- 4. STAFF & PRIESTS
-- ===========================

-- Staff departments table
create table if not exists staff_departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  head_staff_id uuid references staff(id) on delete set null,
  created_at timestamptz default now()
);

alter table staff_departments enable row level security;
do $$ begin
  create policy "Authenticated users can manage staff_departments" on staff_departments
    for all using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

-- Add expanded columns to staff
alter table staff add column if not exists department_id uuid references staff_departments(id) on delete set null;
alter table staff add column if not exists designation text;
alter table staff add column if not exists join_date date;
alter table staff add column if not exists date_of_birth date;
alter table staff add column if not exists address text;
alter table staff add column if not exists photo_url text;
alter table staff add column if not exists emergency_contact_name text;
alter table staff add column if not exists emergency_contact_phone text;
alter table staff add column if not exists salary_amount numeric(12, 2);
alter table staff add column if not exists salary_frequency text default 'monthly';
alter table staff add column if not exists contract_type text default 'Full-time';
alter table staff add column if not exists languages text[];

-- Employee ID auto-generation
create sequence if not exists employee_id_seq;

create or replace function generate_employee_id()
returns trigger as $$
begin
  if new.employee_id is null or new.employee_id = '' then
    new.employee_id := 'EMP-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('employee_id_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_employee_id on staff;
create trigger set_employee_id
  before insert on staff
  for each row execute function generate_employee_id();

-- Staff attendance table
create table if not exists staff_attendance (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references staff(id) on delete cascade not null,
  attendance_date date not null default current_date,
  status text not null default 'Present' check (status in ('Present', 'Absent', 'HalfDay', 'OnLeave', 'Holiday')),
  check_in_time time,
  check_out_time time,
  notes text,
  created_at timestamptz default now(),
  unique(staff_id, attendance_date)
);

create index if not exists idx_staff_attendance_date on staff_attendance(attendance_date);
create index if not exists idx_staff_attendance_staff on staff_attendance(staff_id);

alter table staff_attendance enable row level security;
do $$ begin
  create policy "Authenticated users can manage staff_attendance" on staff_attendance
    for all using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

-- ===========================
-- 5. MEDICAL & HEALTHCARE
-- ===========================

-- Enhance medical_camps
alter table medical_camps add column if not exists capacity integer;
alter table medical_camps add column if not exists specialties text[];
alter table medical_camps add column if not exists organizer_staff_id uuid references staff(id) on delete set null;
alter table medical_camps add column if not exists end_date date;

-- Enhance medical_camp_registrations
alter table medical_camp_registrations add column if not exists status text default 'Registered';
alter table medical_camp_registrations add column if not exists prescription text;
alter table medical_camp_registrations add column if not exists follow_up_date date;
alter table medical_camp_registrations add column if not exists is_walk_in boolean default true;

-- Enhance wellness_consultations
alter table wellness_consultations add column if not exists follow_up_date date;
alter table wellness_consultations add column if not exists session_notes text;
alter table wellness_consultations add column if not exists status text default 'Scheduled';

-- First aid incidents table
create table if not exists first_aid_incidents (
  id uuid primary key default uuid_generate_v4(),
  incident_date date not null default current_date,
  incident_time time,
  location text,
  patient_name text not null,
  patient_contact text,
  incident_type text not null check (incident_type in ('Faint', 'Fall', 'Cut', 'HeatStroke', 'AllergicReaction', 'Burn', 'Fracture', 'Other')),
  treatment_given text,
  referred_to_hospital boolean default false,
  hospital_name text,
  attending_staff_id uuid references staff(id) on delete set null,
  severity text default 'Minor' check (severity in ('Minor', 'Moderate', 'Serious')),
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_first_aid_date on first_aid_incidents(incident_date);

alter table first_aid_incidents enable row level security;
do $$ begin
  create policy "Authenticated users can manage first_aid_incidents" on first_aid_incidents
    for all using (auth.role() = 'authenticated');
exception when duplicate_object then null;
end $$;

-- ===========================
-- 6. IN-KIND DONATIONS
-- ===========================

-- Expand in_kind_donations item_type constraint
alter table in_kind_donations drop constraint if exists in_kind_donations_item_type_check;
alter table in_kind_donations add constraint in_kind_donations_item_type_check
  check (item_type in ('grains', 'clothes', 'books', 'equipment', 'furniture', 'vehicles', 'medical_supplies', 'kitchen_supplies', 'religious_items', 'electronics', 'bedding', 'other'));

-- Add new columns
alter table in_kind_donations add column if not exists estimated_value numeric(12, 2);
alter table in_kind_donations add column if not exists condition text default 'Good';
alter table in_kind_donations add column if not exists photo_url text;
alter table in_kind_donations add column if not exists receipt_number text unique;
alter table in_kind_donations add column if not exists destination text;
alter table in_kind_donations add column if not exists acknowledgement_status text default 'Pending';
alter table in_kind_donations add column if not exists currency text default 'INR';

-- Receipt number auto-generation for in-kind donations
create sequence if not exists in_kind_receipt_seq;

create or replace function generate_in_kind_receipt_number()
returns trigger as $$
begin
  if new.receipt_number is null or new.receipt_number = '' then
    new.receipt_number := 'IKD-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('in_kind_receipt_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_in_kind_receipt_number on in_kind_donations;
create trigger set_in_kind_receipt_number
  before insert on in_kind_donations
  for each row execute function generate_in_kind_receipt_number();

-- ===========================
-- 7. MULTI-CURRENCY
-- ===========================

-- donations already has currency column from phase 4
-- annadaan_donations already handled above
-- in_kind_donations already handled above

-- Add currency to prasad_bookings
alter table prasad_bookings add column if not exists amount numeric(12, 2);
alter table prasad_bookings add column if not exists currency text default 'INR';

-- Add currency to accommodation_bookings if not present
alter table accommodation_bookings add column if not exists currency text default 'INR';

-- ===========================
-- END OF MIGRATION
-- ===========================
