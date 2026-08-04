import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PropertyCard from "@/components/public/property-card";
import PublicShell from "@/components/public/public-shell";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionary";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();
  const locale = getLocale();

  const { data: listings, error } = await supabase
    .from("properties")
    .select(
      "id, slug, title_en, title_ar, price, wilayat, governorate, status, cover_image_id, property_images!property_images_property_id_fkey(id, storage_path)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) console.error("Failed to load featured properties:", error.message);

  const cards =
    listings?.map((listing) => {
      const cover =
        listing.property_images?.find((img) => img.id === listing.cover_image_id) ??
        listing.property_images?.[0];
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
      <section className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="animate-fade-up font-display text-4xl sm:text-5xl">
          {t(locale, "home_heading")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl animate-fade-up text-base-900/60 [animation-delay:100ms]">
          {t(locale, "home_subheading")}
        </p>
        <Link
          href="/properties"
          className="mt-8 inline-block animate-fade-up rounded-lg bg-accent px-8 py-3 font-medium text-white hover:bg-accent-light [animation-delay:200ms]"
        >
          {t(locale, "home_cta")}
        </Link>
      </section>

      {cards.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <h2 className="mb-6 font-display text-2xl">{t(locale, "home_featured")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <PropertyCard
                  slug={card.slug}
                  title={card.title}
                  price={card.price}
                  wilayat={card.wilayat}
                  governorate={card.governorate}
                  status={card.status}
                  coverUrl={card.coverUrl}
                  locale={locale}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </PublicShell>
  );
}
