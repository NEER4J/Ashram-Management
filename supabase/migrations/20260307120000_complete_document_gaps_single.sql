-- ==========================================
-- COMPLETE DOCUMENT GAPS – SINGLE MIGRATION
-- Run this file once to apply all phases (1–10) from the Ashram Management System document.
-- Requires: existing tables devotees, staff, temple_events, event_registrations, donations,
--           inventory_items, user_profiles (from your initial schema).
-- ==========================================

-- Enable extension if not already
create extension if not exists "uuid-ossp";

-- ==================== PHASE 1: Devotee & CRM + Visitor ====================

-- Devotee new columns
alter table devotees add column if not exists emergency_contact_name text;
alter table devotees add column if not exists emergency_contact_phone text;
alter table devotees add column if not exists medical_notes text;
alter table devotees add column if not exists dietary_preferences text;
alter table devotees add column if not exists photo_url text;
alter table devotees add column if not exists relationship_status text default 'Active';
alter table devotees add column if not exists first_visit_date date;
alter table devotees add column if not exists last_visit_date date;
alter table devotees add column if not exists spiritual_notes text;

do $$ begin alter table devotees add constraint devotees_relationship_status_check check (relationship_status in ('Active', 'Inactive', 'Lapsed')); exception when others then null; end $$;

-- Enums (idempotent)
do $$ begin if not exists (select 1 from pg_type where typname = 'kyc_document_type') then create type kyc_document_type as enum ('Aadhaar', 'PAN', 'Passport'); end if; end $$;
do $$ begin if not exists (select 1 from pg_type where typname = 'milestone_type') then create type milestone_type as enum ('birthday', 'anniversary', 'spiritual_milestone'); end if; end $$;
do $$ begin if not exists (select 1 from pg_type where typname = 'communication_channel') then create type communication_channel as enum ('call', 'email', 'whatsapp', 'sms'); end if; end $$;
do $$ begin if not exists (select 1 from pg_type where typname = 'communication_direction') then create type communication_direction as enum ('inbound', 'outbound'); end if; end $$;

create table if not exists devotee_tags (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete cascade not null, tag_name text not null, created_at timestamptz default now(), unique(devotee_id, tag_name));
create index if not exists idx_devotee_tags_devotee_id on devotee_tags(devotee_id);

create table if not exists devotee_kyc_documents (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete cascade not null, document_type kyc_document_type not null, file_path text not null, verified_at timestamptz, created_at timestamptz default now());
create index if not exists idx_devotee_kyc_devotee_id on devotee_kyc_documents(devotee_id);

create table if not exists devotee_milestones (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete cascade not null, milestone_type milestone_type not null, date date not null, notes text, created_at timestamptz default now());
create index if not exists idx_devotee_milestones_devotee_id on devotee_milestones(devotee_id);

create table if not exists devotee_communications (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete cascade not null, channel communication_channel not null, direction communication_direction not null, summary text, created_at timestamptz default now(), created_by uuid references auth.users(id));
create index if not exists idx_devotee_communications_devotee_id on devotee_communications(devotee_id);

create table if not exists devotee_notes (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete cascade not null, note text not null, follow_up_date date, created_at timestamptz default now(), created_by uuid references auth.users(id));
create index if not exists idx_devotee_notes_devotee_id on devotee_notes(devotee_id);
create index if not exists idx_devotee_notes_follow_up on devotee_notes(follow_up_date) where follow_up_date is not null;

create table if not exists visitor_registrations (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete set null, name text not null, phone text not null, email text, visit_purpose text, visit_date date default current_date, check_in_at timestamptz, check_out_at timestamptz, visitor_pass_code text unique, qr_code_url text, is_walk_in boolean default true, is_vip boolean default false, special_arrangements_note text, feedback_text text, created_at timestamptz default now());
create index if not exists idx_visitor_registrations_visit_date on visitor_registrations(visit_date);
create index if not exists idx_visitor_registrations_phone on visitor_registrations(phone);
create index if not exists idx_visitor_registrations_pass_code on visitor_registrations(visitor_pass_code);

create sequence if not exists visitor_pass_code_seq;
create or replace function generate_visitor_pass_code() returns trigger as $$ begin if new.visitor_pass_code is null or new.visitor_pass_code = '' then new.visitor_pass_code := 'V-' || extract(year from current_date)::text || '-' || lpad(nextval('visitor_pass_code_seq')::text, 4, '0'); end if; return new; end; $$ language plpgsql;
drop trigger if exists set_visitor_pass_code on visitor_registrations;
create trigger set_visitor_pass_code before insert on visitor_registrations for each row execute function generate_visitor_pass_code();

alter table devotee_tags enable row level security;
alter table devotee_kyc_documents enable row level security;
alter table devotee_milestones enable row level security;
alter table devotee_communications enable row level security;
alter table devotee_notes enable row level security;
alter table visitor_registrations enable row level security;

drop policy if exists "Authenticated full access devotee_tags" on devotee_tags;
create policy "Authenticated full access devotee_tags" on devotee_tags for all using (auth.role() = 'authenticated');
drop policy if exists "Authenticated full access devotee_kyc_documents" on devotee_kyc_documents;
create policy "Authenticated full access devotee_kyc_documents" on devotee_kyc_documents for all using (auth.role() = 'authenticated');
drop policy if exists "Authenticated full access devotee_milestones" on devotee_milestones;
create policy "Authenticated full access devotee_milestones" on devotee_milestones for all using (auth.role() = 'authenticated');
drop policy if exists "Authenticated full access devotee_communications" on devotee_communications;
create policy "Authenticated full access devotee_communications" on devotee_communications for all using (auth.role() = 'authenticated');
drop policy if exists "Authenticated full access devotee_notes" on devotee_notes;
create policy "Authenticated full access devotee_notes" on devotee_notes for all using (auth.role() = 'authenticated');
drop policy if exists "Authenticated full access visitor_registrations" on visitor_registrations;
create policy "Authenticated full access visitor_registrations" on visitor_registrations for all using (auth.role() = 'authenticated');

-- Phase 1 storage buckets
insert into storage.buckets (id, name, public) values ('devotee-documents', 'devotee-documents', false), ('devotee-photos', 'devotee-photos', true) on conflict (id) do nothing;
drop policy if exists "Authenticated read devotee-documents" on storage.objects;
drop policy if exists "Authenticated insert devotee-documents" on storage.objects;
drop policy if exists "Authenticated update devotee-documents" on storage.objects;
drop policy if exists "Authenticated delete devotee-documents" on storage.objects;
create policy "Authenticated read devotee-documents" on storage.objects for select using (bucket_id = 'devotee-documents' and auth.role() = 'authenticated');
create policy "Authenticated insert devotee-documents" on storage.objects for insert with check (bucket_id = 'devotee-documents' and auth.role() = 'authenticated');
create policy "Authenticated update devotee-documents" on storage.objects for update using (bucket_id = 'devotee-documents' and auth.role() = 'authenticated');
create policy "Authenticated delete devotee-documents" on storage.objects for delete using (bucket_id = 'devotee-documents' and auth.role() = 'authenticated');
drop policy if exists "Public read devotee-photos" on storage.objects;
drop policy if exists "Authenticated upload devotee-photos" on storage.objects;
drop policy if exists "Authenticated update devotee-photos" on storage.objects;
drop policy if exists "Authenticated delete devotee-photos" on storage.objects;
create policy "Public read devotee-photos" on storage.objects for select using (bucket_id = 'devotee-photos');
create policy "Authenticated upload devotee-photos" on storage.objects for insert with check (bucket_id = 'devotee-photos' and auth.role() = 'authenticated');
create policy "Authenticated update devotee-photos" on storage.objects for update using (bucket_id = 'devotee-photos' and auth.role() = 'authenticated');
create policy "Authenticated delete devotee-photos" on storage.objects for delete using (bucket_id = 'devotee-photos' and auth.role() = 'authenticated');

-- ==================== PHASE 2: Accommodation ====================

do $$ begin if not exists (select 1 from pg_type where typname = 'room_type_enum') then create type room_type_enum as enum ('single', 'double', 'dormitory', 'family_suite'); end if; end $$;
do $$ begin if not exists (select 1 from pg_type where typname = 'booking_status_enum') then create type booking_status_enum as enum ('Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'); end if; end $$;

create table if not exists rooms (id uuid primary key default uuid_generate_v4(), code text unique not null, name text not null, room_type room_type_enum not null, bed_count integer not null default 1, amenities jsonb default '{}', building text, is_active boolean default true, base_price_per_night numeric(10, 2) default 0, housekeeping_status text default 'Ready', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists beds (id uuid primary key default uuid_generate_v4(), room_id uuid references rooms(id) on delete cascade not null, bed_label text not null, is_available boolean default true, created_at timestamptz default now(), unique(room_id, bed_label));
create index if not exists idx_beds_room_id on beds(room_id);
create table if not exists room_maintenance (id uuid primary key default uuid_generate_v4(), room_id uuid references rooms(id) on delete cascade not null, scheduled_date date not null, completed_at timestamptz, notes text, created_at timestamptz default now());
create index if not exists idx_room_maintenance_room_id on room_maintenance(room_id);

create table if not exists accommodation_bookings (id uuid primary key default uuid_generate_v4(), booking_code text unique, devotee_id uuid references devotees(id) on delete set null, room_id uuid references rooms(id) on delete set null, bed_id uuid references beds(id) on delete set null, check_in_date date not null, check_out_date date not null, status booking_status_enum default 'Pending', actual_check_in_at timestamptz, actual_check_out_at timestamptz, special_requests text, number_of_guests integer default 1, total_amount numeric(12, 2) default 0, payment_status text default 'Pending', guest_name text, guest_phone text, guest_email text, meal_preference text, wake_up_call time, laundry_notes text, special_assistance text, source text default 'admin', created_at timestamptz default now(), updated_at timestamptz default now());
create index if not exists idx_accommodation_bookings_dates on accommodation_bookings(check_in_date, check_out_date);
create index if not exists idx_accommodation_bookings_devotee on accommodation_bookings(devotee_id);
create index if not exists idx_accommodation_bookings_status on accommodation_bookings(status);
create sequence if not exists accommodation_booking_code_seq;
create or replace function generate_accommodation_booking_code() returns trigger as $$ begin if new.booking_code is null or new.booking_code = '' then new.booking_code := 'ACC-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('accommodation_booking_code_seq')::text, 4, '0'); end if; return new; end; $$ language plpgsql;
drop trigger if exists set_accommodation_booking_code on accommodation_bookings;
create trigger set_accommodation_booking_code before insert on accommodation_bookings for each row execute function generate_accommodation_booking_code();

create table if not exists booking_waitlist (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete cascade, guest_name text, guest_phone text, guest_email text, desired_check_in date not null, desired_check_out date not null, room_type_preference room_type_enum, notes text, created_at timestamptz default now());
create index if not exists idx_booking_waitlist_dates on booking_waitlist(desired_check_in, desired_check_out);
create table if not exists guest_feedback (id uuid primary key default uuid_generate_v4(), booking_id uuid references accommodation_bookings(id) on delete cascade not null, rating integer check (rating >= 1 and rating <= 5), comment text, created_at timestamptz default now());
create index if not exists idx_guest_feedback_booking on guest_feedback(booking_id);

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

-- ==================== PHASE 3: Events ====================

create table if not exists venues (id uuid primary key default uuid_generate_v4(), name text not null, capacity integer, location text, is_active boolean default true, created_at timestamptz default now());
alter table temple_events add column if not exists venue_id uuid references venues(id) on delete set null;
alter table temple_events add column if not exists capacity integer;
alter table temple_events add column if not exists recurrence_rule text;
alter table temple_events add column if not exists recurrence_end_date date;
alter table temple_events add column if not exists speaker_facilitator_id uuid references staff(id) on delete set null;
alter table temple_events add column if not exists resource_plan text;
alter table temple_events add column if not exists budget numeric(12, 2);
alter table temple_events add column if not exists stream_url text;
alter table temple_events add column if not exists stream_embed text;

create table if not exists event_materials (id uuid primary key default uuid_generate_v4(), event_id uuid references temple_events(id) on delete cascade not null, name text not null, type text, url_or_path text, created_at timestamptz default now());
create index if not exists idx_event_materials_event_id on event_materials(event_id);
alter table event_registrations add column if not exists fee_paid numeric(10, 2) default 0;
alter table event_registrations add column if not exists certificate_issued_at timestamptz;

create table if not exists event_registration_waitlist (id uuid primary key default uuid_generate_v4(), event_id uuid references temple_events(id) on delete cascade not null, devotee_id uuid references devotees(id) on delete cascade not null, created_at timestamptz default now(), unique(event_id, devotee_id));
create index if not exists idx_event_registration_waitlist_event on event_registration_waitlist(event_id);
create table if not exists event_volunteer_assignments (id uuid primary key default uuid_generate_v4(), event_id uuid references temple_events(id) on delete cascade not null, devotee_id uuid references devotees(id) on delete cascade, role text, slot text, created_at timestamptz default now());
create index if not exists idx_event_volunteer_assignments_event on event_volunteer_assignments(event_id);

alter table venues enable row level security;
alter table event_materials enable row level security;
alter table event_registration_waitlist enable row level security;
alter table event_volunteer_assignments enable row level security;
create policy "Authenticated full access venues" on venues for all using (auth.role() = 'authenticated');
create policy "Public read venues" on venues for select using (true);
create policy "Authenticated full access event_materials" on event_materials for all using (auth.role() = 'authenticated');
create policy "Authenticated full access event_registration_waitlist" on event_registration_waitlist for all using (auth.role() = 'authenticated');
create policy "Authenticated full access event_volunteer_assignments" on event_volunteer_assignments for all using (auth.role() = 'authenticated');

-- ==================== PHASE 4: Donations ====================

alter table donations add column if not exists is_anonymous boolean default false;
alter table donations add column if not exists recurring_donation_id uuid;
alter table donations add column if not exists pledge_id uuid;
alter table donations add column if not exists receipt_number text unique;
alter table donations add column if not exists receipt_generated_at timestamptz;
alter table donations add column if not exists currency text default 'INR';

create table if not exists recurring_donations (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete set null, amount numeric(12, 2) not null, frequency text not null check (frequency in ('monthly', 'quarterly', 'yearly')), payment_method text, next_charge_date date, status text default 'Active' check (status in ('Active', 'Paused', 'Cancelled')), created_at timestamptz default now());
create index if not exists idx_recurring_donations_next_charge on recurring_donations(next_charge_date);
create table if not exists donation_pledges (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete cascade not null, amount numeric(12, 2) not null, due_date date, status text default 'Pending' check (status in ('Pending', 'Fulfilled', 'Cancelled')), created_at timestamptz default now());

do $$ begin if not exists (select 1 from information_schema.table_constraints where constraint_name = 'donations_recurring_donation_id_fkey') then alter table donations add constraint donations_recurring_donation_id_fkey foreign key (recurring_donation_id) references recurring_donations(id) on delete set null; end if; end $$;
do $$ begin if not exists (select 1 from information_schema.table_constraints where constraint_name = 'donations_pledge_id_fkey') then alter table donations add constraint donations_pledge_id_fkey foreign key (pledge_id) references donation_pledges(id) on delete set null; end if; end $$;

create table if not exists in_kind_donations (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete set null, donation_date date default current_date, item_type text not null check (item_type in ('grains', 'clothes', 'books', 'other')), description text, quantity numeric(10, 2) default 1, unit text default 'PCS', created_at timestamptz default now());

create sequence if not exists donation_receipt_number_seq;
create or replace function set_donation_receipt_number() returns trigger as $$ begin if new.receipt_number is null and new.receipt_generated_at is not null then new.receipt_number := 'RCP-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('donation_receipt_number_seq')::text, 5, '0'); end if; return new; end; $$ language plpgsql;
drop trigger if exists set_donation_receipt_number_trigger on donations;
create trigger set_donation_receipt_number_trigger before insert or update on donations for each row execute function set_donation_receipt_number();

alter table recurring_donations enable row level security;
alter table donation_pledges enable row level security;
alter table in_kind_donations enable row level security;
create policy "Authenticated full access recurring_donations" on recurring_donations for all using (auth.role() = 'authenticated');
create policy "Authenticated full access donation_pledges" on donation_pledges for all using (auth.role() = 'authenticated');
create policy "Authenticated full access in_kind_donations" on in_kind_donations for all using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public) values ('donation-receipts', 'donation-receipts', false) on conflict (id) do nothing;
drop policy if exists "Authenticated read donation-receipts" on storage.objects;
drop policy if exists "Authenticated insert donation-receipts" on storage.objects;
create policy "Authenticated read donation-receipts" on storage.objects for select using (bucket_id = 'donation-receipts' and auth.role() = 'authenticated');
create policy "Authenticated insert donation-receipts" on storage.objects for insert with check (bucket_id = 'donation-receipts' and auth.role() = 'authenticated');

-- ==================== PHASE 5: Seva & Volunteers ====================

create table if not exists volunteers (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete cascade not null unique, joined_at date default current_date, skills text[], interests text[], category text check (category in ('Regular', 'Occasional', 'Retired', 'Youth')), availability jsonb default '{}', background_verified_at date, training_certifications text, created_at timestamptz default now(), updated_at timestamptz default now());
create index if not exists idx_volunteers_devotee on volunteers(devotee_id);
create table if not exists seva_opportunities (id uuid primary key default uuid_generate_v4(), name text not null, category text not null, description text, location text, is_active boolean default true, created_at timestamptz default now());
create table if not exists seva_shifts (id uuid primary key default uuid_generate_v4(), opportunity_id uuid references seva_opportunities(id) on delete cascade not null, shift_date date not null, start_time time not null, end_time time not null, slots_needed integer default 1, created_at timestamptz default now());
create index if not exists idx_seva_shifts_opportunity on seva_shifts(opportunity_id);
create table if not exists seva_assignments (id uuid primary key default uuid_generate_v4(), shift_id uuid references seva_shifts(id) on delete cascade not null, volunteer_id uuid references volunteers(id) on delete cascade not null, status text default 'Assigned' check (status in ('Assigned', 'Completed', 'NoShow')), hours_actual numeric(5, 2), created_at timestamptz default now(), unique(shift_id, volunteer_id));
create index if not exists idx_seva_assignments_shift on seva_assignments(shift_id);
create index if not exists idx_seva_assignments_volunteer on seva_assignments(volunteer_id);
create table if not exists volunteer_badges (id uuid primary key default uuid_generate_v4(), volunteer_id uuid references volunteers(id) on delete cascade not null, badge_type text not null, awarded_at timestamptz default now());
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

-- ==================== PHASE 6: Prasad & Kitchen ====================

create table if not exists meal_menus (id uuid primary key default uuid_generate_v4(), menu_date date not null, meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')), items jsonb default '[]', special_diet_notes text, created_at timestamptz default now());
create table if not exists meal_tokens (id uuid primary key default uuid_generate_v4(), token_code text unique not null, meal_date date not null, meal_type text not null, devotee_id uuid references devotees(id), issued_at timestamptz default now(), redeemed_at timestamptz);
create table if not exists prasad_bookings (id uuid primary key default uuid_generate_v4(), occasion text not null, booking_date date not null, devotee_id uuid references devotees(id), quantity integer default 1, status text default 'Pending', created_at timestamptz default now());
create table if not exists annadaan_donations (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id), amount numeric(12, 2), in_kind_description text, donation_date date default current_date, purpose text, created_at timestamptz default now());
create table if not exists kitchen_inventory (id uuid primary key default uuid_generate_v4(), item_name text not null, category text, quantity numeric(10, 2) default 0, unit text default 'kg', min_level numeric(10, 2) default 0, expiry_date date, updated_at timestamptz default now());

alter table meal_menus enable row level security;
alter table meal_tokens enable row level security;
alter table prasad_bookings enable row level security;
alter table annadaan_donations enable row level security;
alter table kitchen_inventory enable row level security;
create policy "Auth meal_menus" on meal_menus for all using (auth.role() = 'authenticated');
create policy "Auth meal_tokens" on meal_tokens for all using (auth.role() = 'authenticated');
create policy "Auth prasad_bookings" on prasad_bookings for all using (auth.role() = 'authenticated');
create policy "Auth annadaan_donations" on annadaan_donations for all using (auth.role() = 'authenticated');
create policy "Auth kitchen_inventory" on kitchen_inventory for all using (auth.role() = 'authenticated');

-- ==================== PHASE 7: Inventory, Assets, Religious ====================

create table if not exists inventory_locations (id uuid primary key default uuid_generate_v4(), name text not null, type text, created_at timestamptz default now());
alter table inventory_items add column if not exists location_id uuid references inventory_locations(id);
create table if not exists purchase_orders (id uuid primary key default uuid_generate_v4(), po_number text unique, vendor_id uuid, status text default 'Draft', order_date date default current_date, expected_date date, created_at timestamptz default now());
create table if not exists inventory_transfers (id uuid primary key default uuid_generate_v4(), item_id uuid references inventory_items(id) not null, from_location_id uuid references inventory_locations(id), to_location_id uuid references inventory_locations(id), quantity numeric(10, 2) not null, transferred_at timestamptz default now());
create table if not exists fixed_assets (id uuid primary key default uuid_generate_v4(), name text not null, category text check (category in ('Land', 'Building', 'Vehicle', 'Equipment')), purchase_date date, purchase_value numeric(15, 2), depreciation_method text, useful_life_years integer, current_value numeric(15, 2), location text, barcode_or_rfid text, created_at timestamptz default now());
create table if not exists religious_items (id uuid primary key default uuid_generate_v4(), name text not null, type text check (type in ('book', 'idol', 'photo', 'puja_material')), quantity integer default 0, location text, is_saleable boolean default false, created_at timestamptz default now());

alter table purchase_orders enable row level security;
alter table inventory_transfers enable row level security;
alter table fixed_assets enable row level security;
alter table religious_items enable row level security;
alter table inventory_locations enable row level security;
create policy "Auth inventory_locations" on inventory_locations for all using (auth.role() = 'authenticated');
create policy "Auth purchase_orders" on purchase_orders for all using (auth.role() = 'authenticated');
create policy "Auth inventory_transfers" on inventory_transfers for all using (auth.role() = 'authenticated');
create policy "Auth fixed_assets" on fixed_assets for all using (auth.role() = 'authenticated');
create policy "Auth religious_items" on religious_items for all using (auth.role() = 'authenticated');

-- ==================== PHASE 8: Medical ====================

create table if not exists medical_camps (id uuid primary key default uuid_generate_v4(), name text not null, camp_date date not null, location text, description text, status text default 'Scheduled', created_at timestamptz default now());
create table if not exists medical_camp_registrations (id uuid primary key default uuid_generate_v4(), camp_id uuid references medical_camps(id) on delete cascade not null, patient_name text not null, contact text, notes text, created_at timestamptz default now());
create table if not exists emergency_contacts (id uuid primary key default uuid_generate_v4(), name text not null, role text, phone text not null, type text check (type in ('ambulance', 'hospital', 'doctor')), created_at timestamptz default now());
create table if not exists wellness_consultations (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) not null, consultation_date date not null, practitioner_id uuid references staff(id), type text default 'Ayurveda', treatment_plan text, created_at timestamptz default now());

alter table medical_camps enable row level security;
alter table medical_camp_registrations enable row level security;
alter table emergency_contacts enable row level security;
alter table wellness_consultations enable row level security;
create policy "Auth medical_camps" on medical_camps for all using (auth.role() = 'authenticated');
create policy "Auth medical_camp_registrations" on medical_camp_registrations for all using (auth.role() = 'authenticated');
create policy "Auth emergency_contacts" on emergency_contacts for all using (auth.role() = 'authenticated');
create policy "Auth wellness_consultations" on wellness_consultations for all using (auth.role() = 'authenticated');

-- ==================== PHASE 9: Communication ====================

create table if not exists message_templates (id uuid primary key default uuid_generate_v4(), name text not null, channel text not null check (channel in ('sms', 'email', 'whatsapp')), body text not null, variables text[], created_at timestamptz default now());
create table if not exists communication_logs (id uuid primary key default uuid_generate_v4(), devotee_id uuid references devotees(id) on delete cascade, channel text not null, direction text, subject_or_summary text, sent_at timestamptz default now(), status text default 'Sent');
create index if not exists idx_communication_logs_devotee on communication_logs(devotee_id);

alter table message_templates enable row level security;
alter table communication_logs enable row level security;
create policy "Auth message_templates" on message_templates for all using (auth.role() = 'authenticated');
create policy "Auth communication_logs" on communication_logs for all using (auth.role() = 'authenticated');

-- ==================== PHASE 10: Roles, Audit ====================

create table if not exists roles (id uuid primary key default uuid_generate_v4(), name text not null unique, description text, created_at timestamptz default now());
create table if not exists permissions (id uuid primary key default uuid_generate_v4(), module text not null, action text not null check (action in ('create', 'read', 'update', 'delete')), unique(module, action));
create table if not exists role_permissions (role_id uuid references roles(id) on delete cascade, permission_id uuid references permissions(id) on delete cascade, primary key (role_id, permission_id));
alter table user_profiles add column if not exists role_id uuid references roles(id);

insert into roles (name, description) values ('Super Admin', 'Full system access'), ('Ashram Manager', 'Operational oversight'), ('Financial Controller', 'Finance and donations'), ('Event Coordinator', 'Programs and events'), ('Front Desk', 'Visitor and accommodation'), ('Volunteer Coordinator', 'Seva management') on conflict (name) do nothing;

create table if not exists audit_logs (id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users(id), table_name text not null, record_id uuid, action text not null, old_values jsonb, new_values jsonb, at timestamptz default now());
create index if not exists idx_audit_logs_table_record on audit_logs(table_name, record_id);
create index if not exists idx_audit_logs_at on audit_logs(at);

alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table audit_logs enable row level security;
create policy "Auth roles" on roles for all using (auth.role() = 'authenticated');
create policy "Auth permissions" on permissions for all using (auth.role() = 'authenticated');
create policy "Auth role_permissions" on role_permissions for all using (auth.role() = 'authenticated');
create policy "Auth audit_logs" on audit_logs for all using (auth.role() = 'authenticated');

-- ==========================================
-- END – Document gaps single migration
-- ==========================================
