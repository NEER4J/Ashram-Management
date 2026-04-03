-- ============================================================
-- Contact inquiries table
-- Stores submissions from the marketing site contact form
-- ============================================================

create table if not exists public.contact_inquiries (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email             text not null,
  organisation_name text,
  organisation_type text,
  subject           text,
  message           text not null,
  status            text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  created_at        timestamptz not null default now()
);

-- RLS: unauthenticated users can insert (public contact form)
-- Only admins can read
alter table public.contact_inquiries enable row level security;

create policy "Anyone can submit contact inquiry"
  on public.contact_inquiries for insert
  with check (true);

create policy "Admins can read contact inquiries"
  on public.contact_inquiries for select
  using (public.is_admin());

create policy "Admins can update contact inquiries"
  on public.contact_inquiries for update
  using (public.is_admin())
  with check (public.is_admin());
