-- Phase 4: Schema
-- Run this whole file in Supabase → SQL Editor → New query → Run

create extension if not exists "pgcrypto";

create type property_status as enum ('draft', 'published', 'reserved', 'sold');
create type property_category as enum ('villa', 'apartment', 'land', 'commercial', 'townhouse');

create table properties (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  slug text unique not null,
  status property_status not null default 'draft',
  title_en text not null default '',
  title_ar text not null default '',
  description_en text not null default '',
  description_ar text not null default '',
  category property_category,
  tags text[] not null default '{}',
  price numeric,
  governorate text,
  wilayat text,
  area text,
  land_size numeric,
  lat numeric,
  lng numeric,
  cover_image_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  width int,
  height int,
  created_at timestamptz not null default now()
);

alter table properties
  add constraint fk_cover_image
  foreign key (cover_image_id) references property_images(id) on delete set null;

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_id uuid,
  actor text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_properties_status on properties(status);
create index idx_properties_category on properties(category);
create index idx_properties_governorate on properties(governorate);
create index idx_property_images_property_id on property_images(property_id);

-- Keep updated_at accurate automatically
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_properties_updated_at
  before update on properties
  for each row execute function set_updated_at();
