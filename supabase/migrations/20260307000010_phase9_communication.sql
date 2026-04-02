-- Phase 9: Communication & Notifications (Doc §10)
create table if not exists message_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  channel text not null check (channel in ('sms', 'email', 'whatsapp')),
  body text not null,
  variables text[],
  created_at timestamptz default now()
);

create table if not exists communication_logs (
  id uuid primary key default uuid_generate_v4(),
  devotee_id uuid references devotees(id) on delete cascade,
  channel text not null,
  direction text,
  subject_or_summary text,
  sent_at timestamptz default now(),
  status text default 'Sent'
);

create index if not exists idx_communication_logs_devotee on communication_logs(devotee_id);

alter table message_templates enable row level security;
alter table communication_logs enable row level security;

create policy "Auth message_templates" on message_templates for all using (auth.role() = 'authenticated');
create policy "Auth communication_logs" on communication_logs for all using (auth.role() = 'authenticated');
