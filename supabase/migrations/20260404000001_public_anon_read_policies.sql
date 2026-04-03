-- ============================================================
-- Allow anonymous (public) reads for data shown on /a/[slug] pages
-- ============================================================

-- Events: published + active events are visible to everyone
create policy "Anon read published events"
  on public.temple_events for select
  to anon
  using (is_published = true and is_active = true);

-- Study materials: published materials visible to everyone
create policy "Anon read published study materials"
  on public.study_materials for select
  to anon
  using (is_published = true);

-- Rooms: active rooms visible to everyone
create policy "Anon read active rooms"
  on public.rooms for select
  to anon
  using (is_active = true);

-- Accommodations: active properties visible to everyone
-- (policy may already exist from hotel_accommodations migration, so use IF NOT EXISTS pattern)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'accommodations' and policyname = 'Anon read active accommodations'
  ) then
    execute $policy$
      create policy "Anon read active accommodations"
        on public.accommodations for select
        to anon
        using (is_active = true)
    $policy$;
  end if;
end $$;
