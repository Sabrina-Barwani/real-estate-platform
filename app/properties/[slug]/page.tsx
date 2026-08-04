import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Gallery from "@/components/public/gallery";
import PublicShell from "@/components/public/public-shell";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionary";
import { trackPropertyView } from "@/actions/analytics-actions";

export const revalidate = 60;

export default async function PropertyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const locale = getLocale();

  const { data: property, error } = await supabase
    .from("properties")
    .select("*, property_images!property_images_property_id_fkey(id, storage_path, sort_order)")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();
  if (error) console.error("Failed to load property:", error.message);

  if (!property) {
    notFound();
  }

  // Awaited (not fire-and-forget): on serverless hosting, unawaited work
  // can get cancelled the moment the response is sent, so a "fire and
  // forget" call here would silently never complete. The RPC is a single
  // fast row update, so the latency cost is negligible.
  await trackPropertyView(property.id);

  const sortedImages = [...(property.property_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const orderedImages = [
    ...sortedImages.filter((img) => img.id === property.cover_image_id),
    ...sortedImages.filter((img) => img.id !== property.cover_image_id),
  ].map((img) => ({
    id: img.id,
    url: supabase.storage.from("property-images").getPublicUrl(img.storage_path).data.publicUrl,
  }));

  const whatsappUrl = buildWhatsAppUrl(property);
  const title = locale === "ar" && property.title_ar ? property.title_ar : property.title_en;
  const description =
    locale === "ar" && property.description_ar ? property.description_ar : property.description_en;

  return (
    <PublicShell locale={locale}>
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-10 sm:pb-12">
        <Gallery images={orderedImages} />

        <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <p className="mb-2 font-mono text-xs tracking-wide text-base-900/40">{property.reference}</p>
            <h1 className="font-display text-4xl leading-tight tracking-tight">{title}</h1>
            <p className="mt-2 text-base-900/60">
              {[property.wilayat, property.governorate].filter(Boolean).join(", ")}
            </p>
          </div>
          <div className="sm:text-end">
            {property.price && (
              <p className="font-display text-3xl text-gold">
                OMR {Number(property.price).toLocaleString()}
              </p>
            )}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 hidden rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white transition hover:bg-accent-light sm:inline-block"
            >
              {t(locale, "inquire_whatsapp")}
            </a>
          </div>
        </div>

        {description && (
          <p className="mt-8 max-w-3xl leading-relaxed text-base-900/80">{description}</p>
        )}

        <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-base-900/10 bg-white p-6 shadow-soft sm:grid-cols-4">
          {property.category && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-base-900/40">{t(locale, "category_label")}</dt>
              <dd className="mt-1 font-display capitalize">{property.category}</dd>
            </div>
          )}
          {property.land_size && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-base-900/40">{t(locale, "land_size_label")}</dt>
              <dd className="mt-1 font-display">{property.land_size} m²</dd>
            </div>
          )}
          <div>
            <dt className="text-xs uppercase tracking-wide text-base-900/40">{t(locale, "status_label")}</dt>
            <dd className="mt-1 font-display capitalize">{property.status}</dd>
          </div>
        </dl>

        {property.lat && property.lng && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-base-900/10">
            <iframe
              title="Location"
              width="100%"
              height="320"
              loading="lazy"
              src={`https://www.google.com/maps?q=${property.lat},${property.lng}&output=embed`}
            />
          </div>
        )}
      </main>

      {/* Sticky mobile CTA — a pattern real portals use well: the
          inquiry action stays reachable without scrolling back up. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-base-900/10 bg-base-50/95 p-3 backdrop-blur sm:hidden">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-full bg-accent py-3.5 text-center text-sm font-medium text-white"
        >
          {t(locale, "inquire_whatsapp")}
        </a>
      </div>
    </PublicShell>
  );
}
