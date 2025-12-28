-- Migration: Remove budget, add city and state to temple_events
-- Create master tables for Indian states and cities

-- Remove budget column from temple_events
alter table temple_events drop column if exists budget;

-- Add city and state columns to temple_events (add first, before updating)
alter table temple_events add column if not exists city text;
alter table temple_events add column if not exists state text;

-- Migrate location data to city/state (if location column exists)
-- Parse "City, State" format from location column
do $$
begin
    if exists (select 1 from information_schema.columns 
               where table_name = 'temple_events' and column_name = 'location') then
        update temple_events
        set 
            city = trim(split_part(location, ',', 1)),
            state = trim(split_part(location, ',', 2))
        where location is not null and location != '' 
            and (city is null or city = '') 
            and (state is null or state = '');
    end if;
end $$;

-- Drop location column after migration
alter table temple_events drop column if exists location;

-- Create master_states table for Indian states
create table if not exists master_states (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    code text unique, -- State code like 'MH', 'UP', etc.
    is_active boolean default true,
    created_at timestamptz default now()
); 

-- Create master_cities table for Indian cities
create table if not exists master_cities (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    state_id uuid references master_states(id) on delete cascade,
    is_active boolean default true,
    created_at timestamptz default now(),
    unique(name, state_id)
);

-- Create indexes
create index if not exists idx_master_cities_state_id on master_cities(state_id);

-- Insert Indian states
insert into master_states (name, code) values
('Andhra Pradesh', 'AP'),
('Arunachal Pradesh', 'AR'),
('Assam', 'AS'),
('Bihar', 'BR'),
('Chhattisgarh', 'CG'),
('Goa', 'GA'),
('Gujarat', 'GJ'),
('Haryana', 'HR'),
('Himachal Pradesh', 'HP'),
('Jharkhand', 'JH'),
('Karnataka', 'KA'),
('Kerala', 'KL'),
('Madhya Pradesh', 'MP'),
('Maharashtra', 'MH'),
('Manipur', 'MN'),
('Meghalaya', 'ML'),
('Mizoram', 'MZ'),
('Nagaland', 'NL'),
('Odisha', 'OD'),
('Punjab', 'PB'),
('Rajasthan', 'RJ'),
('Sikkim', 'SK'),
('Tamil Nadu', 'TN'),
('Telangana', 'TS'),
('Tripura', 'TR'),
('Uttar Pradesh', 'UP'),
('Uttarakhand', 'UK'),
('West Bengal', 'WB'),
('Andaman and Nicobar Islands', 'AN'),
('Chandigarh', 'CH'),
('Dadra and Nagar Haveli and Daman and Diu', 'DH'),
('Delhi', 'DL'),
('Jammu and Kashmir', 'JK'),
('Ladakh', 'LA'),
('Lakshadweep', 'LD'),
('Puducherry', 'PY')
on conflict (name) do nothing;

-- Insert major cities for each state (top cities)
do $$
declare
    state_rec record;
begin
    -- Andhra Pradesh
    for state_rec in select id from master_states where code = 'AP' loop
        insert into master_cities (name, state_id) values
        ('Visakhapatnam', state_rec.id),
        ('Vijayawada', state_rec.id),
        ('Guntur', state_rec.id),
        ('Nellore', state_rec.id),
        ('Tirupati', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Assam
    for state_rec in select id from master_states where code = 'AS' loop
        insert into master_cities (name, state_id) values
        ('Guwahati', state_rec.id),
        ('Silchar', state_rec.id),
        ('Dibrugarh', state_rec.id),
        ('Jorhat', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Bihar
    for state_rec in select id from master_states where code = 'BR' loop
        insert into master_cities (name, state_id) values
        ('Patna', state_rec.id),
        ('Gaya', state_rec.id),
        ('Bhagalpur', state_rec.id),
        ('Muzaffarpur', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Delhi
    for state_rec in select id from master_states where code = 'DL' loop
        insert into master_cities (name, state_id) values
        ('New Delhi', state_rec.id),
        ('Delhi', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Gujarat
    for state_rec in select id from master_states where code = 'GJ' loop
        insert into master_cities (name, state_id) values
        ('Ahmedabad', state_rec.id),
        ('Surat', state_rec.id),
        ('Vadodara', state_rec.id),
        ('Rajkot', state_rec.id),
        ('Gandhinagar', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Haryana
    for state_rec in select id from master_states where code = 'HR' loop
        insert into master_cities (name, state_id) values
        ('Gurgaon', state_rec.id),
        ('Faridabad', state_rec.id),
        ('Chandigarh', state_rec.id),
        ('Panchkula', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Karnataka
    for state_rec in select id from master_states where code = 'KA' loop
        insert into master_cities (name, state_id) values
        ('Bangalore', state_rec.id),
        ('Mysore', state_rec.id),
        ('Hubli', state_rec.id),
        ('Mangalore', state_rec.id),
        ('Belgaum', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Kerala
    for state_rec in select id from master_states where code = 'KL' loop
        insert into master_cities (name, state_id) values
        ('Kochi', state_rec.id),
        ('Trivandrum', state_rec.id),
        ('Calicut', state_rec.id),
        ('Thrissur', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Madhya Pradesh
    for state_rec in select id from master_states where code = 'MP' loop
        insert into master_cities (name, state_id) values
        ('Indore', state_rec.id),
        ('Bhopal', state_rec.id),
        ('Gwalior', state_rec.id),
        ('Jabalpur', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Maharashtra
    for state_rec in select id from master_states where code = 'MH' loop
        insert into master_cities (name, state_id) values
        ('Mumbai', state_rec.id),
        ('Pune', state_rec.id),
        ('Nagpur', state_rec.id),
        ('Nashik', state_rec.id),
        ('Aurangabad', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Odisha
    for state_rec in select id from master_states where code = 'OD' loop
        insert into master_cities (name, state_id) values
        ('Bhubaneswar', state_rec.id),
        ('Cuttack', state_rec.id),
        ('Rourkela', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Punjab
    for state_rec in select id from master_states where code = 'PB' loop
        insert into master_cities (name, state_id) values
        ('Ludhiana', state_rec.id),
        ('Amritsar', state_rec.id),
        ('Jalandhar', state_rec.id),
        ('Patiala', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Rajasthan
    for state_rec in select id from master_states where code = 'RJ' loop
        insert into master_cities (name, state_id) values
        ('Jaipur', state_rec.id),
        ('Jodhpur', state_rec.id),
        ('Kota', state_rec.id),
        ('Bikaner', state_rec.id),
        ('Udaipur', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Tamil Nadu
    for state_rec in select id from master_states where code = 'TN' loop
        insert into master_cities (name, state_id) values
        ('Chennai', state_rec.id),
        ('Coimbatore', state_rec.id),
        ('Madurai', state_rec.id),
        ('Tiruchirappalli', state_rec.id),
        ('Salem', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Telangana
    for state_rec in select id from master_states where code = 'TS' loop
        insert into master_cities (name, state_id) values
        ('Hyderabad', state_rec.id),
        ('Warangal', state_rec.id),
        ('Nizamabad', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Uttar Pradesh
    for state_rec in select id from master_states where code = 'UP' loop
        insert into master_cities (name, state_id) values
        ('Lucknow', state_rec.id),
        ('Kanpur', state_rec.id),
        ('Agra', state_rec.id),
        ('Varanasi', state_rec.id),
        ('Allahabad', state_rec.id),
        ('Noida', state_rec.id),
        ('Ghaziabad', state_rec.id),
        ('Ayodhya', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- Uttarakhand
    for state_rec in select id from master_states where code = 'UK' loop
        insert into master_cities (name, state_id) values
        ('Dehradun', state_rec.id),
        ('Haridwar', state_rec.id),
        ('Rishikesh', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;

    -- West Bengal
    for state_rec in select id from master_states where code = 'WB' loop
        insert into master_cities (name, state_id) values
        ('Kolkata', state_rec.id),
        ('Howrah', state_rec.id),
        ('Durgapur', state_rec.id),
        ('Asansol', state_rec.id)
        on conflict (name, state_id) do nothing;
    end loop;
end $$;

-- Enable RLS on master tables
alter table master_states enable row level security;
alter table master_cities enable row level security;

-- Allow public read access to states and cities
create policy "Public read access to states" on master_states for select using (is_active = true);
create policy "Public read access to cities" on master_cities for select using (is_active = true);

-- Allow authenticated users full access
create policy "Authenticated users full access to states" on master_states for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access to cities" on master_cities for all using (auth.role() = 'authenticated');

