type Property = {
  reference: string;
  title_en: string;
  wilayat: string | null;
  governorate: string | null;
  price: number | null;
  land_size: number | null;
  slug: string;
};

// Builds a wa.me link pre-filled with the inquiry message. The visitor still
// has to press Send themselves — this never sends anything automatically.
export function buildWhatsAppUrl(property: Property): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const propertyUrl = `${siteUrl}/properties/${property.slug}`;

  const lines = [
    `Hi, I'm interested in this property:`,
    `Reference: ${property.reference}`,
    `${property.title_en}`,
    `Location: ${[property.wilayat, property.governorate].filter(Boolean).join(", ")}`,
    property.price ? `Price: OMR ${property.price}` : null,
    property.land_size ? `Land size: ${property.land_size} m²` : null,
    propertyUrl,
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${phone}?text=${text}`;
}
