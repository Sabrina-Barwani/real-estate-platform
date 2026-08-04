-- Phase 4: Row Level Security
-- Run this after 001_schema.sql, also in the SQL Editor.

alter table properties enable row level security;
alter table property_images enable row level security;
alter table audit_log enable row level security;

-- Because there is no sign-up route anywhere in this app, the only way to
-- become "authenticated" is the single admin account created directly in
-- the Supabase dashboard. So "authenticated" and "admin" are equivalent here
-- — no need for a separate roles table for a one-admin system.

-- properties: public can read published only; admin can do everything
create policy "public read published properties"
  on properties for select
  to anon, authenticated
  using (status = 'published');

create policy "admin full access properties"
  on properties for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- property_images: public can read images only for published properties
create policy "public read images of published properties"
  on property_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = property_images.property_id
      and properties.status = 'published'
    )
  );

create policy "admin full access images"
  on property_images for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- audit_log: admin read-only. No insert/update/delete policy exists for any
-- role — all writes happen exclusively through the service-role client in
-- server actions, which bypasses RLS entirely and can't be reached from the
-- browser. This means even the admin's own browser session cannot tamper
-- with the log.
create policy "admin read audit log"
  on audit_log for select
  to authenticated
  using (auth.role() = 'authenticated');
