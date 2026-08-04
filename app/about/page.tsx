import PublicShell from "@/components/public/public-shell";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionary";

export default function AboutPage() {
  const locale = getLocale();
  return (
    <PublicShell locale={locale}>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-6 font-display text-3xl">{t(locale, "about_heading")}</h1>
        <p className="leading-relaxed text-base-900/80">{t(locale, "about_body")}</p>
      </main>
    </PublicShell>
  );
}
