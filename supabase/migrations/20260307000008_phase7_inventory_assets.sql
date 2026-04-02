-- Phase 7: Inventory, Assets, Religious items (Doc §8)
create table if not exists inventory_locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text,
  created_at timestamptz default now()
);

alter table inventory_items add column if not exists location_id uuid references inventory_locations(id);

create table if not exists purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  po_number text unique,
  vendor_id uuid,
  status text default 'Draft',
  order_date date default current_date,
  expected_date date,
  created_at timestamptz default now()
);

create table if not exists inventory_transfers (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references inventory_items(id) not null,
  from_location_id uuid references inventory_locations(id),
  to_location_id uuid references inventory_locations(id),
  quantity numeric(10, 2) not null,
  transferred_at timestamptz default now()
);

create table if not exists fixed_assets (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text check (category in ('Land', 'Building', 'Vehicle', 'Equipment')),
  purchase_date date,
  purchase_value numeric(15, 2),
  depreciation_method text,
  useful_life_years integer,
  current_value numeric(15, 2),
  location text,
  barcode_or_rfid text,
  created_at timestamptz default now()
);

create table if not exists religious_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text check (type in ('book', 'idol', 'photo', 'puja_material')),
  quantity integer default 0,
  location text,
  is_saleable boolean default false,
  created_at timestamptz default now()
);

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
