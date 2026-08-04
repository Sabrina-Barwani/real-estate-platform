-- Phase 4: Optional seed data — run this if you want sample listings to test
-- the public site with in later phases. Safe to skip.

insert into properties
  (reference, slug, status, title_en, title_ar, description_en, description_ar,
   category, price, governorate, wilayat, area, land_size)
values
  ('PR-2026-0001', 'seaview-villa-muscat', 'published',
   'Seaview Villa in Muscat', 'فيلا بإطلالة بحرية في مسقط',
   'A spacious villa with panoramic sea views, modern finishes, and a private garden.',
   'فيلا واسعة بإطلالة بحرية بانورامية وتشطيبات حديثة وحديقة خاصة.',
   'villa', 285000, 'Muscat', 'Qurayyat', 'Yiti', 600),
  ('PR-2026-0002', 'downtown-apartment-muscat', 'published',
   'Downtown Apartment', 'شقة في وسط المدينة',
   'A modern two-bedroom apartment close to the city center, ideal for professionals.',
   'شقة حديثة بغرفتي نوم بالقرب من وسط المدينة، مثالية للمهنيين.',
   'apartment', 95000, 'Muscat', 'Bawshar', 'Al Khuwair', null);
