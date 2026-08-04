import PublicShell from "@/components/public/public-shell";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionary";
import { getSettings } from "@/lib/settings";

export default async function ContactPage() {
  const locale = getLocale();
  const { whatsapp_number: phone } = await getSettings();
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Hi, I have a question about your properties."
  )}`;

  return (
    <PublicShell locale={locale}>
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-6 font-display text-3xl">{t(locale, "contact_heading")}</h1>
        <p className="mb-8 text-base-900/60">{t(locale, "contact_body")}</p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-accent px-8 py-3 font-medium text-white hover:bg-accent-light"
        >
          {t(locale, "contact_button")}
        </a>
      </main>
    </PublicShell>
  );
}
