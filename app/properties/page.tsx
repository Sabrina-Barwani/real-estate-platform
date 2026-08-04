import { createClient } from "@/lib/supabase/server";
import PropertyCard from "@/components/public/property-card";
import FilterBar from "@/components/public/filter-bar";
import PublicShell from "@/components/public/public-shell";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionary";

export const revalidate = 60;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: { q?: string; governorate?: string; category?: string };
}) {
  const supabase = createClient();
  const locale = getLocale();

  let query = supabase
    .from("properties")
    .select(
      "id, slug, reference, title_en, title_ar, price, wilayat, governorate, status, cover_image_id, property_images!property_images_property_id_fkey(id, storage_path)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (searchParams.governorate) {
    query = query.ilike("governorate", `%${searchParams.governorate}%`);
  }
  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }
  if (searchParams.q) {
    const q = searchParams.q;
    query = query.or(
      `title_en.ilike.%${q}%,description_en.ilike.%${q}%,title_ar.ilike.%${q}%,description_ar.ilike.%${q}%`
    );
  }

  const { data: listings, error } = await query;
  if (error) console.error("Failed to load properties:", error.message);

  const cards =
    listings?.map((listing) => {
      const cover = listing.property_images?.find((img) => img.id === listing.cover_image_id)
        ?? listing.property_images?.[0];
      return {
        ...listing,
        title: locale === "ar" && listing.title_ar ? listing.title_ar : listing.title_en,
        coverUrl: cover
          ? supabase.storage.from("property-images").getPublicUrl(cover.storage_path).data.publicUrl
          : null,
      };
    }) ?? [];

  return (
    <PublicShell locale={locale}>
      <main className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="mb-1 font-display text-4xl tracking-tight">{t(locale, "properties_heading")}</h1>
        <p className="mb-8 text-sm text-base-900/50">
          {cards.length} {cards.length === 1 ? "listing" : "listings"}
        </p>

        <div className="mb-10 rounded-2xl border border-base-900/10 bg-white p-4 shadow-soft">
          <FilterBar defaults={searchParams} locale={locale} />
        </div>

        {cards.length === 0 ? (
          <p className="text-base-900/50">{t(locale, "no_results")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <PropertyCard
                key={card.id}
                slug={card.slug}
                title={card.title}
                reference={card.reference}
                price={card.price}
                wilayat={card.wilayat}
                governorate={card.governorate}
                status={card.status}
                coverUrl={card.coverUrl}
                locale={locale}
              />
            ))}
          </div>
        )}
      </main>
    </PublicShell>
  );
}
