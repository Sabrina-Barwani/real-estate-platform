export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const dictionary = {
  en: {
    nav_properties: "Properties",
    nav_about: "About",
    nav_contact: "Contact",
    home_heading: "Find your next property",
    home_subheading: "A curated selection of premium properties across Oman.",
    home_cta: "Browse properties",
    home_featured: "Featured listings",
    trust_1: "No agents",
    trust_2: "One point of contact",
    trust_3: "Every listing personally verified",
    properties_heading: "Properties",
    search_placeholder: "Search listings…",
    governorate_placeholder: "Governorate",
    all_categories: "All categories",
    search_button: "Search",
    no_results: "No listings match your search.",
    no_photo: "No photo yet",
    inquire_whatsapp: "Inquire on WhatsApp",
    category_label: "Category",
    land_size_label: "Land size",
    status_label: "Status",
    about_heading: "About",
    about_body:
      "We curate a small selection of premium properties across Oman. Every listing on this site is handled personally, from first photo to final handover.",
    contact_heading: "Contact",
    contact_body: "The quickest way to reach us is WhatsApp.",
    contact_button: "Message us on WhatsApp",
    footer_rights: "All rights reserved.",
  },
  ar: {
    nav_properties: "العقارات",
    nav_about: "من نحن",
    nav_contact: "اتصل بنا",
    home_heading: "ابحث عن عقارك القادم",
    home_subheading: "مجموعة مختارة من العقارات المميزة في جميع أنحاء عُمان.",
    home_cta: "تصفح العقارات",
    home_featured: "عقارات مميزة",
    trust_1: "بدون وسطاء",
    trust_2: "نقطة تواصل واحدة",
    trust_3: "كل عقار موثق شخصيًا",
    properties_heading: "العقارات",
    search_placeholder: "ابحث في العقارات…",
    governorate_placeholder: "المحافظة",
    all_categories: "جميع الفئات",
    search_button: "بحث",
    no_results: "لا توجد عقارات مطابقة لبحثك.",
    no_photo: "لا توجد صورة بعد",
    inquire_whatsapp: "استفسر عبر واتساب",
    category_label: "الفئة",
    land_size_label: "مساحة الأرض",
    status_label: "الحالة",
    about_heading: "من نحن",
    about_body:
      "نقدم مجموعة مختارة من العقارات المميزة في جميع أنحاء عُمان. يتم التعامل مع كل عقار بشكل شخصي، من أول صورة حتى التسليم النهائي.",
    contact_heading: "اتصل بنا",
    contact_body: "أسرع طريقة للتواصل معنا هي واتساب.",
    contact_button: "راسلنا عبر واتساب",
    footer_rights: "جميع الحقوق محفوظة.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function t(locale: Locale, key: keyof (typeof dictionary)["en"]): string {
  return dictionary[locale][key] ?? dictionary.en[key];
}
