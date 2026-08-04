import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingForm from "@/components/admin/listing-form";
import ImageManager from "@/components/admin/image-manager";
import { updateListing } from "@/actions/listing-actions";

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!property) {
    notFound();
  }

  const { data: images } = await supabase
    .from("property_images")
    .select("id, storage_path, sort_order")
    .eq("property_id", params.id)
    .order("sort_order", { ascending: true });

  const imageItems =
    images?.map((img) => ({
      id: img.id,
      sort_order: img.sort_order,
      url: supabase.storage.from("property-images").getPublicUrl(img.storage_path).data.publicUrl,
    })) ?? [];

  const boundUpdate = updateListing.bind(null, params.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-display">Edit Listing</h1>
      <p className="mb-6 text-sm text-base-900/60">
        Reference: {property.reference}
      </p>
      <ListingForm action={boundUpdate} defaults={property} submitLabel="Save changes" />

      <hr className="my-10 border-base-900/10" />

      <h2 className="mb-4 text-xl font-display">Photos</h2>
      <ImageManager propertyId={params.id} initialImages={imageItems} coverImageId={property.cover_image_id} />
    </div>
  );
}
