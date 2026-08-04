import { z } from "zod";

export const propertyStatusEnum = z.enum(["draft", "published", "reserved", "sold"]);
export const propertyCategoryEnum = z.enum([
  "villa",
  "apartment",
  "land",
  "commercial",
  "townhouse",
]);

// Fields the admin actually fills in manually (price + location), per the brief.
// Title/description/tags/category get overwritten by the AI pipeline in Phase 5c,
// but the schema allows manual entry too, since AI generation is a convenience,
// not a hard requirement of the data model.
export const propertySchema = z.object({
  title_en: z.string().min(3, "Title (EN) is required"),
  title_ar: z.string().min(3, "Title (AR) is required"),
  description_en: z.string().default(""),
  description_ar: z.string().default(""),
  category: propertyCategoryEnum.nullable(),
  tags: z.array(z.string()).default([]),
  price: z.coerce.number().positive("Price must be a positive number"),
  governorate: z.string().min(1, "Governorate is required"),
  wilayat: z.string().min(1, "Wilayat is required"),
  area: z.string().min(1, "Area is required"),
  land_size: z.coerce.number().positive().nullable().optional(),
  lat: z.coerce.number().nullable().optional(),
  lng: z.coerce.number().nullable().optional(),
  featured: z.boolean().default(false),
});

export type PropertyInput = z.infer<typeof propertySchema>;
