import ListingForm from "@/components/admin/listing-form";
import { createListing } from "@/actions/listing-actions";

export default function NewListingPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-display">Create Listing</h1>
      <p className="mb-6 text-sm text-base-900/60">
        Saved as a draft first. Photos and AI-generated content come next — this creates the record.
      </p>
      <ListingForm action={createListing} submitLabel="Create draft" />
    </div>
  );
}
