-- ==========================================
-- Phase 4: Donations & receipts automation (Doc §4)
-- ==========================================

-- Donations: new columns
alter table donations add column if not exists is_anonymous boolean default false;
alter table donations add column if not exists recurring_donation_id uuid;
alter table donations add column if not exists pledge_id uuid;
alter table donations add column if not exists receipt_number text unique;
alter table donations add column if not exists receipt_generated_at timestamptz;
alter table donations add column if not exists currency text default 'INR';

-- Recurring donations
create table if not exists recurring_donations (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete set null,
  amount numeric(12, 2) not null,
  frequency text not null check (frequency in ('monthly', 'quarterly', 'yearly')),
  payment_method text,
  next_charge_date date,
  status text default 'Active' check (status in ('Active', 'Paused', 'Cancelled')),
  created_at timestamptz default now()
);
create index if not exists idx_recurring_donations_next_charge on recurring_donations(next_charge_date);

-- Pledges
create table if not exists donation_pledges (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete cascade not null,
  amount numeric(12, 2) not null,
  due_date date,
  status text default 'Pending' check (status in ('Pending', 'Fulfilled', 'Cancelled')),
  created_at timestamptz default now()
);

-- Add FK after tables exist
do $$
begin
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'donations_recurring_donation_id_fkey') then
    alter table donations add constraint donations_recurring_donation_id_fkey foreign key (recurring_donation_id) references recurring_donations(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'donations_pledge_id_fkey') then
    alter table donations add constraint donations_pledge_id_fkey foreign key (pledge_id) references donation_pledges(id) on delete set null;
  end if;
end $$;

-- In-kind donations
create table if not exists in_kind_donations (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete set null,
  donation_date date default current_date,
  item_type text not null check (item_type in ('grains', 'clothes', 'books', 'other')),
  description text,
  quantity numeric(10, 2) default 1,
  unit text default 'PCS',
  created_at timestamptz default now()
);

-- Receipt number sequence
create sequence if not exists donation_receipt_number_seq;

create or replace function set_donation_receipt_number()
returns trigger as $$
begin
  if new.receipt_number is null and new.receipt_generated_at is not null then
    new.receipt_number := 'RCP-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('donation_receipt_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_donation_receipt_number_trigger on donations;
create trigger set_donation_receipt_number_trigger
  before insert or update on donations
  for each row execute function set_donation_receipt_number();

-- RLS
alter table recurring_donations enable row level security;
alter table donation_pledges enable row level security;
alter table in_kind_donations enable row level security;

create policy "Authenticated full access recurring_donations" on recurring_donations for all using (auth.role() = 'authenticated');
create policy "Authenticated full access donation_pledges" on donation_pledges for all using (auth.role() = 'authenticated');
create policy "Authenticated full access in_kind_donations" on in_kind_donations for all using (auth.role() = 'authenticated');
