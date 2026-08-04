import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/admin/status-badge";
import { deleteListing, duplicateListing, setListingStatus } from "@/actions/listing-actions";
import ConfirmButton from "@/components/admin/confirm-button";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const supabase = createClient();
  let query = supabase
    .from("properties")
    .select("id, reference, title_en, status, price, governorate, wilayat")
    .order("created_at", { ascending: false });

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams.q) {
    query = query.or(`title_en.ilike.%${searchParams.q}%,reference.ilike.%${searchParams.q}%`);
  }

  const { data: listings, error } = await query;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-display">Listings</h1>
        <Link
          href="/admin/listings/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light"
        >
          + Create Listing
        </Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          placeholder="Search title or reference…"
          defaultValue={searchParams.q}
          className="rounded-lg border border-base-900/10 px-3 py-2 text-sm"
        />
        <select
          name="status"
          defaultValue={searchParams.status ?? ""}
          className="rounded-lg border border-base-900/10 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
        <button type="submit" className="rounded-lg border border-base-900/10 px-3 py-2 text-sm">
          Filter
        </button>
      </form>

      {error && <p className="text-sm text-red-600">Could not load listings.</p>}

      <div className="overflow-hidden rounded-lg border border-base-900/10">
        <table className="w-full text-sm">
          <thead className="bg-base-900/5 text-left">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-base-900/50">
                  No listings yet.
                </td>
              </tr>
            )}
            {listings?.map((listing) => (
              <tr key={listing.id} className="border-t border-base-900/10">
                <td className="px-4 py-3 font-mono text-xs">{listing.reference}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/listings/${listing.id}/edit`} className="hover:underline">
                    {listing.title_en}
                  </Link>
                </td>
                <td className="px-4 py-3"><StatusBadge status={listing.status} /></td>
                <td className="px-4 py-3">{listing.price ? `OMR ${listing.price}` : "—"}</td>
                <td className="px-4 py-3">{listing.wilayat}, {listing.governorate}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {listing.status !== "published" && (
                      <form action={setListingStatus.bind(null, listing.id, "published")}>
                        <button className="text-xs text-emerald-700 hover:underline">Publish</button>
                      </form>
                    )}
                    {listing.status !== "reserved" && (
                      <form action={setListingStatus.bind(null, listing.id, "reserved")}>
                        <button className="text-xs text-amber-700 hover:underline">Mark reserved</button>
                      </form>
                    )}
                    {listing.status !== "sold" && (
                      <form action={setListingStatus.bind(null, listing.id, "sold")}>
                        <button className="text-xs text-red-700 hover:underline">Mark sold</button>
                      </form>
                    )}
                    <form action={duplicateListing.bind(null, listing.id)}>
                      <button className="text-xs text-base-900/60 hover:underline">Duplicate</button>
                    </form>
                    <form action={deleteListing.bind(null, listing.id)}>
                      <ConfirmButton
                        confirmMessage={`Delete "${listing.title_en}"? This can't be undone.`}
                        className="text-xs text-red-700 hover:underline"
                      >
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
