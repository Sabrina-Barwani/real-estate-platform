-- Phase: Admin completeness — Settings
-- Run in Supabase → SQL Editor.

create table site_settings (
  id smallint primary key default 1 check (id = 1), -- enforces exactly one row
  site_name text not null default 'Real Estate',
  whatsapp_number text not null default '',
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (1);

alter table site_settings enable row level security;

-- Public needs to read this (site name in the header, WhatsApp number for
-- inquiry links) — it holds nothing sensitive, just display config.
create policy "public read site settings"
  on site_settings for select
  to anon, authenticated
  using (true);

create policy "admin update site settings"
  on site_settings for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create trigger trg_site_settings_updated_at
  before update on site_settings
  for each row execute function set_updated_at();
