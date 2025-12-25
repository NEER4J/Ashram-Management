-- ==========================================
-- Gurukul Study Materials System Schema
-- ==========================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Master Material Categories
-- ==========================================

create table if not exists master_material_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  parent_id uuid references master_material_categories(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ==========================================
-- 2. Study Materials (Main Table)
-- ==========================================

create table if not exists study_materials (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  type text not null check (type in ('Book', 'PDF', 'Video', 'Audio', 'Course')),
  price numeric(10, 2) default 0,
  is_free boolean default false,
  is_published boolean default false,
  cover_image_url text,
  author text,
  language text default 'English',
  category_id uuid references master_material_categories(id),
  stock_quantity numeric(10, 2) default 0, -- For physical books
  is_digital boolean default true,
  file_urls jsonb default '[]'::jsonb, -- Array of file URLs for digital materials
  metadata jsonb default '{}'::jsonb, -- Additional metadata (duration, pages, etc.)
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- ==========================================
-- 3. Course Modules (for structured courses)
-- ==========================================

create table if not exists course_modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references study_materials(id) on delete cascade not null,
  title text not null,
  description text,
  order_index integer not null default 0,
  content_type text not null check (content_type in ('Video', 'PDF', 'Text', 'Audio')),
  content_url text,
  duration_minutes integer,
  is_preview boolean default false, -- Free preview module
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- 4. Course Enrollments
-- ==========================================

create table if not exists course_enrollments (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references study_materials(id) on delete cascade not null,
  devotee_id uuid references devotees(id) on delete cascade not null,
  enrolled_at timestamptz default now(),
  progress_percentage numeric(5, 2) default 0,
  last_accessed_at timestamptz,
  completed_at timestamptz,
  unique(course_id, devotee_id)
);

-- ==========================================
-- 5. Module Progress Tracking
-- ==========================================

create table if not exists module_progress (
  id uuid primary key default uuid_generate_v4(),
  enrollment_id uuid references course_enrollments(id) on delete cascade not null,
  module_id uuid references course_modules(id) on delete cascade not null,
  completed_at timestamptz,
  time_spent_minutes integer default 0,
  last_accessed_at timestamptz default now(),
  unique(enrollment_id, module_id)
);

-- ==========================================
-- 6. Study Material Orders
-- ==========================================

create table if not exists study_material_orders (
  id uuid primary key default uuid_generate_v4(),
  order_code text unique, -- ORD-YYYY-####
  devotee_id uuid references devotees(id),
  order_date date default current_date,
  total_amount numeric(12, 2) not null,
  payment_status text default 'Pending' check (payment_status in ('Pending', 'Partial', 'Paid', 'Failed', 'Refunded')),
  payment_mode text, -- Cash, UPI, Online Transfer, etc.
  transaction_ref text,
  delivery_status text default 'Pending' check (delivery_status in ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  shipping_address jsonb, -- For physical items
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- ==========================================
-- 7. Order Items
-- ==========================================

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references study_material_orders(id) on delete cascade not null,
  material_id uuid references study_materials(id),
  quantity integer default 1,
  unit_price numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  item_type text not null check (item_type in ('Material', 'Course'))
);

-- ==========================================
-- 8. Indexes for Performance
-- ==========================================

create index if not exists idx_study_materials_type on study_materials(type);
create index if not exists idx_study_materials_category on study_materials(category_id);
create index if not exists idx_study_materials_published on study_materials(is_published) where is_published = true;
create index if not exists idx_course_modules_course on course_modules(course_id);
create index if not exists idx_course_enrollments_course on course_enrollments(course_id);
create index if not exists idx_course_enrollments_devotee on course_enrollments(devotee_id);
create index if not exists idx_module_progress_enrollment on module_progress(enrollment_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_study_material_orders_devotee on study_material_orders(devotee_id);
create index if not exists idx_study_material_orders_date on study_material_orders(order_date);

-- ==========================================
-- 9. Triggers for Updated At
-- ==========================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_study_materials_updated_at
  before update on study_materials
  for each row
  execute function update_updated_at_column();

create trigger update_course_modules_updated_at
  before update on course_modules
  for each row
  execute function update_updated_at_column();

-- ==========================================
-- 10. Function to Generate Order Code
-- ==========================================

create or replace function generate_order_code()
returns text as $$
declare
  year_part text;
  seq_num integer;
  new_code text;
begin
  year_part := to_char(current_date, 'YYYY');
  
  -- Get the next sequence number for this year
  select coalesce(max(cast(substring(order_code from 9) as integer)), 0) + 1
  into seq_num
  from study_material_orders
  where order_code like 'ORD-' || year_part || '-%';
  
  new_code := 'ORD-' || year_part || '-' || lpad(seq_num::text, 4, '0');
  return new_code;
end;
$$ language plpgsql;

-- ==========================================
-- 11. Seed Data for Categories
-- ==========================================

insert into master_material_categories (name, description) values
('Spiritual Texts', 'Sacred scriptures and religious texts'),
('Philosophy', 'Philosophical teachings and discourses'),
('Yoga & Meditation', 'Yoga practices and meditation guides'),
('Bhajans & Music', 'Devotional songs and spiritual music'),
('Courses', 'Structured learning courses'),
('Videos', 'Educational and spiritual videos'),
('Audio', 'Audio recordings and podcasts')
on conflict do nothing;

