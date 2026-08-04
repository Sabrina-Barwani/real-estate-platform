"use server";

import { randomUUID } from "crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "property-images";
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 82;

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  return supabase;
}

// Compresses, optimizes, and converts to WebP server-side with sharp.
// Runs once per file at upload time so every stored image is already
// web-ready — nothing heavy happens at request time on the public site.
async function processImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const input = Buffer.from(arrayBuffer);

  const image = sharp(input).rotate(); // auto-orient using EXIF, then strip it
  const metadata = await image.metadata();

  const resized = image.resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  const output = await resized.webp({ quality: WEBP_QUALITY }).toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
    originalWidth: metadata.width ?? output.info.width,
    originalHeight: metadata.height ?? output.info.height,
  };
}

export async function uploadImages(propertyId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) return { error: "No files received." };

  const { data: existing } = await supabase
    .from("property_images")
    .select("sort_order")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: false })
    .limit(1);

  let nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;
  const errors: string[] = [];

  for (const file of files) {
    try {
      const processed = await processImage(file);
      const path = `${propertyId}/${randomUUID()}.webp`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, processed.buffer, { contentType: "image/webp", upsert: false });

      if (uploadError) {
        errors.push(`${file.name}: upload failed`);
        continue;
      }

      const { error: insertError } = await supabase.from("property_images").insert({
        property_id: propertyId,
        storage_path: path,
        sort_order: nextOrder,
        width: processed.width,
        height: processed.height,
      });

      if (insertError) {
        await supabase.storage.from(BUCKET).remove([path]);
        errors.push(`${file.name}: could not save`);
        continue;
      }

      nextOrder += 1;
    } catch {
      errors.push(`${file.name}: could not process (unsupported or corrupt image)`);
    }
  }

  revalidatePath(`/admin/listings/${propertyId}/edit`);
  return errors.length > 0 ? { error: errors.join("; ") } : undefined;
}

export async function replaceImage(propertyId: string, imageId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "No file received." };

  const { data: existingImage } = await supabase
    .from("property_images")
    .select("storage_path")
    .eq("id", imageId)
    .single();

  if (!existingImage) return { error: "Image not found." };

  try {
    const processed = await processImage(file);
    const newPath = `${propertyId}/${randomUUID()}.webp`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(newPath, processed.buffer, { contentType: "image/webp", upsert: false });

    if (uploadError) return { error: "Upload failed." };

    const { error: updateError } = await supabase
      .from("property_images")
      .update({ storage_path: newPath, width: processed.width, height: processed.height })
      .eq("id", imageId);

    if (updateError) {
      await supabase.storage.from(BUCKET).remove([newPath]);
      return { error: "Could not save replacement." };
    }

    await supabase.storage.from(BUCKET).remove([existingImage.storage_path]);
  } catch {
    return { error: "Could not process image." };
  }

  revalidatePath(`/admin/listings/${propertyId}/edit`);
}

export async function deleteImage(propertyId: string, imageId: string) {
  const supabase = await requireAdmin();

  const { data: image } = await supabase
    .from("property_images")
    .select("storage_path")
    .eq("id", imageId)
    .single();

  if (!image) return;

  // Clear cover_image_id first if this was the cover, to satisfy the FK
  // before the row disappears.
  await supabase
    .from("properties")
    .update({ cover_image_id: null })
    .eq("id", propertyId)
    .eq("cover_image_id", imageId);

  await supabase.from("property_images").delete().eq("id", imageId);
  await supabase.storage.from(BUCKET).remove([image.storage_path]);

  revalidatePath(`/admin/listings/${propertyId}/edit`);
}

export async function setCoverImage(propertyId: string, imageId: string) {
  const supabase = await requireAdmin();
  await supabase.from("properties").update({ cover_image_id: imageId }).eq("id", propertyId);
  revalidatePath(`/admin/listings/${propertyId}/edit`);
}

export async function reorderImages(propertyId: string, orderedIds: string[]) {
  const supabase = await requireAdmin();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("property_images").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidatePath(`/admin/listings/${propertyId}/edit`);
}
