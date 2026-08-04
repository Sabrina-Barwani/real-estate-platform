-- Phase 7b: View tracking
-- Run this in Supabase → SQL Editor.

alter table properties add column if not exists view_count integer not null default 0;

-- SECURITY DEFINER so it can update view_count even though anonymous
-- visitors have no UPDATE grant on properties — the function itself is the
-- only thing that runs with elevated privilege, and it does exactly one
-- fixed operation (increment by 1), nothing arbitrary.
create or replace function increment_property_view(prop_id uuid)
returns void as $$
begin
  update properties set view_count = view_count + 1 where id = prop_id;
end;
$$ language plpgsql security definer;
