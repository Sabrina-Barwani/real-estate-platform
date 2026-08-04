-- Phase: Admin completeness — Featured flag
-- Run in Supabase → SQL Editor.

alter table properties add column if not exists featured boolean not null default false;

create index if not exists idx_properties_featured on properties(featured);
