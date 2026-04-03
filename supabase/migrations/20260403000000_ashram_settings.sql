-- ============================================================
-- Ashram Settings: single-row organization configuration table
-- ============================================================

-- Helper: admin check used in RLS policies
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Main settings table (single-row: id is always 1)
create table if not exists public.ashram_settings (
  id integer primary key default 1 check (id = 1),

  -- General
  ashram_name               text not null default 'Ashram',
  ashram_tagline            text,
  address                   text,
  phone                     text,
  email                     text,
  website                   text,
  timezone                  text not null default 'Asia/Kolkata',
  logo_url                  text,
  favicon_url               text,

  -- Financial
  default_currency          text not null default 'INR'
    check (default_currency in ('INR','USD','GBP','EUR','AUD','SGD','CAD','MYR','SGD')),
  receipt_prefix_donation   text not null default 'DON-',
  receipt_prefix_inkind     text not null default 'IKD-',
  receipt_prefix_booking    text not null default 'BKG-',
  gst_number                text,
  pan_number                text,
  bank_name                 text,
  bank_account_number       text,
  bank_ifsc                 text,
  upi_id                    text,
  financial_year_start_month smallint not null default 4
    check (financial_year_start_month between 1 and 12),

  -- Donations & Receipts
  auto_generate_receipts    boolean not null default true,
  receipt_footer_message    text,
  exemption_80g_number      text,
  receipt_email_subject     text default 'Your donation receipt from {{ashram_name}}',
  receipt_email_body        text,

  -- Accommodation
  default_checkin_time      time not null default '14:00:00',
  default_checkout_time     time not null default '11:00:00',
  late_checkout_fee         numeric(10,2) default 0,
  booking_confirmation_msg  text,

  -- Notifications
  notify_email_new_booking      boolean not null default true,
  notify_email_new_donation     boolean not null default true,
  notify_email_visitor_checkin  boolean not null default false,
  notify_wa_puja_confirmation   boolean not null default false,
  notify_wa_accommodation       boolean not null default false,
  notify_daily_digest           boolean not null default false,

  -- Public Pages / SEO
  seo_title                 text,
  seo_description           text,
  social_facebook           text,
  social_instagram          text,
  social_youtube            text,
  social_whatsapp_number    text,

  -- Integrations (non-sensitive config only — secrets live in env vars)
  google_analytics_id       text,
  razorpay_key_id           text,   -- public key only; secret = RAZORPAY_SECRET env var
  smtp_host                 text,
  smtp_port                 smallint default 587,
  smtp_from_email           text,
  -- smtp_password NOT stored — use SMTP_PASSWORD env var
  wa_display_name           text,
  wa_phone_number_id        text,
  -- wa_token NOT stored — use WHATSAPP_TOKEN env var

  updated_at                timestamptz not null default now(),
  updated_by                uuid references auth.users(id) on delete set null
);

-- ============================================================
-- Trigger: auto-update updated_at and updated_by on every write
-- ============================================================
create or replace function public.touch_ashram_settings()
returns trigger as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ashram_settings_touch on public.ashram_settings;
create trigger ashram_settings_touch
  before update on public.ashram_settings
  for each row execute function public.touch_ashram_settings();

-- ============================================================
-- Trigger: restore the single row if someone deletes it
-- ============================================================
create or replace function public.restore_ashram_settings_row()
returns trigger as $$
begin
  insert into public.ashram_settings (id) values (1)
  on conflict (id) do nothing;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists ashram_settings_restore on public.ashram_settings;
create trigger ashram_settings_restore
  after delete on public.ashram_settings
  for each statement execute function public.restore_ashram_settings_row();

-- ============================================================
-- Seed the guaranteed single row
-- ============================================================
insert into public.ashram_settings (id) values (1)
on conflict (id) do nothing;

-- ============================================================
-- RLS
-- ============================================================
alter table public.ashram_settings enable row level security;

create policy "Authenticated users can read settings"
  on public.ashram_settings for select
  using (auth.role() = 'authenticated');

create policy "Admins can update settings"
  on public.ashram_settings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "No insert via API"
  on public.ashram_settings for insert
  with check (false);

create policy "No delete via API"
  on public.ashram_settings for delete
  using (false);

-- ============================================================
-- Storage bucket: ashram-settings (logos, favicons)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('ashram-settings', 'ashram-settings', true)
on conflict (id) do nothing;

drop policy if exists "Public read ashram-settings" on storage.objects;
drop policy if exists "Admins upload ashram-settings" on storage.objects;
drop policy if exists "Admins update ashram-settings" on storage.objects;
drop policy if exists "Admins delete ashram-settings" on storage.objects;

create policy "Public read ashram-settings"
  on storage.objects for select
  using (bucket_id = 'ashram-settings');

create policy "Admins upload ashram-settings"
  on storage.objects for insert
  with check (bucket_id = 'ashram-settings' and public.is_admin());

create policy "Admins update ashram-settings"
  on storage.objects for update
  using (bucket_id = 'ashram-settings' and public.is_admin());

create policy "Admins delete ashram-settings"
  on storage.objects for delete
  using (bucket_id = 'ashram-settings' and public.is_admin());

-- ============================================================
-- RPC: get_users_with_roles
-- Returns user list with emails (joins auth.users which is
-- not accessible from the client SDK directly)
-- ============================================================
create or replace function public.get_users_with_roles()
returns table (
  id          uuid,
  email       text,
  role        text,
  role_id     uuid,
  role_name   text,
  created_at  timestamptz
) as $$
  select
    up.id,
    au.email,
    up.role,
    up.role_id,
    r.name as role_name,
    up.created_at
  from public.user_profiles up
  join auth.users au on au.id = up.id
  left join public.roles r on r.id = up.role_id
  order by up.created_at desc;
$$ language sql security definer stable;

-- Restrict to authenticated users only (admins check is done in UI)
revoke all on function public.get_users_with_roles() from public, anon;
grant execute on function public.get_users_with_roles() to authenticated;
