-- Phase 10: Reporting, Roles, Security (Doc §19, §18)
create table if not exists roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

create table if not exists permissions (
  id uuid primary key default uuid_generate_v4(),
  module text not null,
  action text not null check (action in ('create', 'read', 'update', 'delete')),
  unique(module, action)
);

create table if not exists role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_id uuid references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

alter table user_profiles add column if not exists role_id uuid references roles(id);

insert into roles (name, description) values
  ('Super Admin', 'Full system access'),
  ('Ashram Manager', 'Operational oversight'),
  ('Financial Controller', 'Finance and donations'),
  ('Event Coordinator', 'Programs and events'),
  ('Front Desk', 'Visitor and accommodation'),
  ('Volunteer Coordinator', 'Seva management')
on conflict (name) do nothing;

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  table_name text not null,
  record_id uuid,
  action text not null,
  old_values jsonb,
  new_values jsonb,
  at timestamptz default now()
);

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
