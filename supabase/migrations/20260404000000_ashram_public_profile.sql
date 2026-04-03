-- ============================================================
-- Ashram Public Profile
-- Adds public-facing profile columns to ashram_settings and
-- allows anonymous reads when is_public = true.
-- ============================================================

alter table public.ashram_settings
  add column if not exists public_slug     text unique,
  add column if not exists is_public       boolean not null default false,
  add column if not exists cover_image_url text,
  add column if not exists about_text      text;

-- Allow anonymous (unauthenticated) reads when the ashram
-- has opted into a public profile.
create policy "Public can read published ashram profile"
  on public.ashram_settings for select
  using (is_public = true);
