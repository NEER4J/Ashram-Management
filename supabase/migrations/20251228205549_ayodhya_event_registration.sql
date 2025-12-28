-- Migration: Add Event Registration Support
-- Adds occupation and event_source columns to devotees table
-- Creates event_registration_analytics table for tracking QR scans and form submissions

-- Add occupation column to devotees table
alter table devotees add column if not exists occupation text;

-- Add event_source column to devotees table
alter table devotees add column if not exists event_source text;

-- Create event_registration_analytics table
create table if not exists event_registration_analytics (
  id uuid primary key default uuid_generate_v4(),
  event_name text not null,
  session_id text not null,
  qr_scan_at timestamptz default now(),
  form_submitted_at timestamptz,
  devotee_id uuid references devotees(id) on delete set null,
  user_agent text,
  ip_address text,
  created_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_event_registration_analytics_event_name on event_registration_analytics(event_name);
create index if not exists idx_event_registration_analytics_session_id on event_registration_analytics(session_id);
create index if not exists idx_devotees_event_source on devotees(event_source);

-- Enable RLS on event_registration_analytics
alter table event_registration_analytics enable row level security;

-- Allow public inserts for tracking QR scans (anonymous access)
create policy "Allow public inserts for event registration analytics"
  on event_registration_analytics
  for insert
  with check (true);

-- Allow authenticated users to read analytics
create policy "Allow authenticated users to read event registration analytics"
  on event_registration_analytics
  for select
  using (auth.role() = 'authenticated');

-- Allow authenticated users to update analytics (for linking devotee_id)
create policy "Allow authenticated users to update event registration analytics"
  on event_registration_analytics
  for update
  using (auth.role() = 'authenticated');

-- Allow public updates for analytics records (for linking devotee_id after form submission)
-- This allows the API route to update records with devotee_id and form_submitted_at
create policy "Allow public updates for event registration analytics"
  on event_registration_analytics
  for update
  with check (true);

-- Allow public inserts into devotees for event registration (with event_source constraint)
-- Note: This policy was updated in later migration to allow any event_source
create policy "Allow public inserts for event registration"
  on devotees
  for insert
  with check (event_source is not null);

