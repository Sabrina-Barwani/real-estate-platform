import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const { data: allListings } = await supabase
    .from("properties")
    .select("id, title_en, status, view_count, slug")
    .order("view_count", { ascending: false });

  const counts = {
    total: allListings?.length ?? 0,
    draft: allListings?.filter((l) => l.status === "draft").length ?? 0,
    published: allListings?.filter((l) => l.status === "published").length ?? 0,
    reserved: allListings?.filter((l) => l.status === "reserved").length ?? 0,
    sold: allListings?.filter((l) => l.status === "sold").length ?? 0,
  };

  const totalViews = allListings?.reduce((sum, l) => sum + (l.view_count ?? 0), 0) ?? 0;
  const topViewed = (allListings ?? []).filter((l) => (l.view_count ?? 0) > 0).slice(0, 5);

  const stats = [
    { label: "Total listings", value: counts.total },
    { label: "Published", value: counts.published },
    { label: "Draft", value: counts.draft },
    { label: "Reserved", value: counts.reserved },
    { label: "Sold", value: counts.sold },
    { label: "Total views", value: totalViews },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-display">Dashboard</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-base-900/10 p-4">
            <p className="text-2xl font-display">{stat.value}</p>
            <p className="text-xs text-base-900/50">{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-display">Most viewed listings</h2>
      {topViewed.length === 0 ? (
        <p className="text-sm text-base-900/50">
          No views yet — views count once a published listing's page is opened publicly.
        </p>
      ) : (
        <ul className="divide-y divide-base-900/10 rounded-lg border border-base-900/10">
          {topViewed.map((listing) => (
            <li key={listing.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <Link href={`/admin/listings/${listing.id}/edit`} className="hover:underline">
                {listing.title_en}
              </Link>
              <span className="text-base-900/50">{listing.view_count} views</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
