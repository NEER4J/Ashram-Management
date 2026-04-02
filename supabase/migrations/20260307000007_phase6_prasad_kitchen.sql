-- Phase 6: Prasad, Food & Kitchen (Doc §7)
create table if not exists meal_menus (
  id uuid primary key default uuid_generate_v4(),
  menu_date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  items jsonb default '[]',
  special_diet_notes text,
  created_at timestamptz default now()
);

create table if not exists meal_tokens (
  id uuid primary key default uuid_generate_v4(),
  token_code text unique not null,
  meal_date date not null,
  meal_type text not null,
  devotee_id uuid references devotees(id),
  issued_at timestamptz default now(),
  redeemed_at timestamptz
);

create table if not exists prasad_bookings (
  id uuid primary key default uuid_generate_v4(),
  occasion text not null,
  booking_date date not null,
  devotee_id uuid references devotees(id),
  quantity integer default 1,
  status text default 'Pending',
  created_at timestamptz default now()
);

create table if not exists annadaan_donations (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id),
  amount numeric(12, 2),
  in_kind_description text,
  donation_date date default current_date,
  purpose text,
  created_at timestamptz default now()
);

create table if not exists kitchen_inventory (
  id uuid primary key default uuid_generate_v4(),
  item_name text not null,
  category text,
  quantity numeric(10, 2) default 0,
  unit text default 'kg',
  min_level numeric(10, 2) default 0,
  expiry_date date,
  updated_at timestamptz default now()
);

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
