import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PropertyCard from "@/components/public/property-card";
import PublicShell from "@/components/public/public-shell";
import HorizonMotif from "@/components/public/horizon-motif";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionary";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();
  const locale = getLocale();

  const { data: listings, error } = await supabase
    .from("properties")
    .select(
      "id, slug, reference, title_en, title_ar, price, wilayat, governorate, status, cover_image_id, featured, property_images!property_images_property_id_fkey(id, storage_path)"
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
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
      <section className="relative overflow-hidden border-b border-base-900/10">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:pt-28">
          <p className="animate-fade-up font-sans text-xs font-medium uppercase tracking-[0.2em] text-gold">
            Oman
          </p>
          <h1 className="mt-4 max-w-2xl animate-fade-up font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl [animation-delay:80ms]">
            {t(locale, "home_heading")}
          </h1>
          <p className="mt-5 max-w-md animate-fade-up text-base-900/60 [animation-delay:160ms]">
            {t(locale, "home_subheading")}
          </p>
          <Link
            href="/properties"
            className="mt-9 inline-block animate-fade-up rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-accent-light [animation-delay:240ms]"
          >
            {t(locale, "home_cta")}
          </Link>
        </div>

        {/* Signature element: the Al Hajar range traced as a single gold
            line, drawn in on load, sitting under the hero copy. */}
        <HorizonMotif className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full text-gold/70 sm:h-44" />
      </section>

      {/* Differentiation strip: states plainly what sets a single-admin,
          curated listing site apart from a mass-market portal. */}
      <section className="border-b border-base-900/10 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-base-900/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            t(locale, "trust_1"),
            t(locale, "trust_2"),
            t(locale, "trust_3"),
          ].map((label) => (
            <div key={label} className="flex items-center gap-3 px-2 py-6 sm:px-8">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span className="text-sm text-base-900/70">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {cards.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="font-display text-2xl">{t(locale, "home_featured")}</h2>
            <Link href="/properties" className="text-sm text-accent hover:underline">
              {t(locale, "nav_properties")} →
            </Link>
          </div>
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
                  reference={card.reference}
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
