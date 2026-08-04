"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { propertySchema, propertyStatusEnum } from "@/lib/validation/property";
import { slugify, generateReference } from "@/lib/slug";

export type ListingFormState = { error?: string } | undefined;

// Every action re-checks the session itself — a server action is a public
// RPC endpoint the moment it exists, regardless of which page calls it.
// RLS then enforces the same rule a second time at the database layer.
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }
  return { supabase, actor: session.user.email ?? "unknown" };
}

async function writeAudit(action: string, entityId: string | null, actor: string, metadata: object = {}) {
  // Uses the privileged client on purpose: no role is ever granted INSERT on
  // audit_log, so this is the only path that can write to it — not even the
  // admin's own browser session can tamper with the log.
  const admin = createAdminClient();
  await admin.from("audit_log").insert({ action, entity_id: entityId, actor, metadata });
}

function parseForm(formData: FormData) {
  const tagsRaw = formData.get("tags");
  const tags =
    typeof tagsRaw === "string" && tagsRaw.trim().length > 0
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  return propertySchema.safeParse({
    title_en: formData.get("title_en"),
    title_ar: formData.get("title_ar"),
    description_en: formData.get("description_en") ?? "",
    description_ar: formData.get("description_ar") ?? "",
    category: formData.get("category") || null,
    tags,
    price: formData.get("price"),
    governorate: formData.get("governorate"),
    wilayat: formData.get("wilayat"),
    area: formData.get("area"),
    land_size: formData.get("land_size") || null,
    lat: formData.get("lat") || null,
    lng: formData.get("lng") || null,
    featured: formData.get("featured") === "on",
  });
}

export async function createListing(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const { supabase, actor } = await requireAdmin();
  const parsed = parseForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const baseSlug = slugify(parsed.data.title_en);
  let id: string | null = null;

  // Retry a few times on the rare chance a reference or slug collides.
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const { data, error } = await supabase
      .from("properties")
      .insert({
        ...parsed.data,
        reference: generateReference(),
        slug: `${baseSlug}${suffix}`,
        status: "draft",
      })
      .select("id")
      .single();

    if (!error) {
      id = data.id;
      break;
    }
    if (error.code !== "23505") {
      // Not a uniqueness violation — don't retry, surface it.
      return { error: "Could not save listing. Please try again." };
    }
  }

  if (!id) {
    return { error: "Could not generate a unique reference. Please try again." };
  }

  await writeAudit("listing.created", id, actor);
  revalidatePath("/admin/listings");
  redirect(`/admin/listings/${id}/edit`);
}

export async function updateListing(
  id: string,
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const { supabase, actor } = await requireAdmin();
  const parsed = parseForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("properties").update(parsed.data).eq("id", id);

  if (error) {
    return { error: "Could not save changes. Please try again." };
  }

  await writeAudit("listing.updated", id, actor);
  revalidatePath("/admin/listings");
  revalidatePath(`/admin/listings/${id}/edit`);
  redirect("/admin/listings");
}

export async function deleteListing(id: string) {
  const { supabase, actor } = await requireAdmin();

  // property_images rows cascade-delete via the FK automatically, but the
  // underlying Storage files don't — remove those first or they become
  // orphaned (still billed, never shown).
  const { data: images } = await supabase
    .from("property_images")
    .select("storage_path")
    .eq("property_id", id);

  if (images && images.length > 0) {
    await supabase.storage.from("property-images").remove(images.map((img) => img.storage_path));
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (!error) {
    await writeAudit("listing.deleted", id, actor);
  }
  revalidatePath("/admin/listings");
}

export async function duplicateListing(id: string) {
  const { supabase, actor } = await requireAdmin();
  const { data: original, error: fetchError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    return;
  }

  const { id: _oldId, reference: _oldRef, slug: _oldSlug, created_at, updated_at, cover_image_id, ...rest } = original;

  const newSlug = `${slugify(original.title_en)}-copy-${Date.now().toString().slice(-5)}`;

  const { data: copy, error } = await supabase
    .from("properties")
    .insert({ ...rest, reference: generateReference(), slug: newSlug, status: "draft" })
    .select("id")
    .single();

  if (!error && copy) {
    await writeAudit("listing.duplicated", copy.id, actor, { from: id });
  }
  revalidatePath("/admin/listings");
}

export async function setListingStatus(id: string, status: string) {
  const { supabase, actor } = await requireAdmin();
  const parsedStatus = propertyStatusEnum.safeParse(status);
  if (!parsedStatus.success) return;

  const { error } = await supabase
    .from("properties")
    .update({ status: parsedStatus.data })
    .eq("id", id);

  if (!error) {
    await writeAudit(`listing.status.${parsedStatus.data}`, id, actor);
  }
  revalidatePath("/admin/listings");
}

// ── Bulk actions ────────────────────────────────────────────────────────
// Each bulk action re-validates the same way a single-item action would —
// there is no separate, looser code path for bulk operations.

export async function bulkSetStatus(ids: string[], status: string) {
  const { supabase, actor } = await requireAdmin();
  const parsedStatus = propertyStatusEnum.safeParse(status);
  if (!parsedStatus.success || ids.length === 0) return;

  const { error } = await supabase
    .from("properties")
    .update({ status: parsedStatus.data })
    .in("id", ids);

  if (!error) {
    await writeAudit(`listing.bulk_status.${parsedStatus.data}`, null, actor, { ids });
  }
  revalidatePath("/admin/listings");
}

export async function bulkDeleteListings(ids: string[]) {
  const { supabase, actor } = await requireAdmin();
  if (ids.length === 0) return;

  const { data: images } = await supabase
    .from("property_images")
    .select("storage_path")
    .in("property_id", ids);

  if (images && images.length > 0) {
    await supabase.storage.from("property-images").remove(images.map((img) => img.storage_path));
  }

  const { error } = await supabase.from("properties").delete().in("id", ids);
  if (!error) {
    await writeAudit("listing.bulk_deleted", null, actor, { ids });
  }
  revalidatePath("/admin/listings");
}
