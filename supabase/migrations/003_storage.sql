-- Phase 4: Storage policies
-- IMPORTANT: before running this, create the bucket manually first:
-- Supabase dashboard → Storage → New bucket → name it exactly "property-images"
-- → toggle "Public bucket" ON (so listing photos can load without auth)
-- Then run this file in the SQL Editor.

create policy "public read property images bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'property-images');

create policy "admin upload property images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images');

create policy "admin update property images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-images');

create policy "admin delete property images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images');
