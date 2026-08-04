import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BulkListingsTable from "@/components/admin/bulk-listings-table";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const supabase = createClient();
  let query = supabase
    .from("properties")
    .select("id, reference, title_en, status, price, governorate, wilayat, featured")
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

      <BulkListingsTable listings={listings ?? []} />
    </div>
  );
}
