import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import type { Locale } from "@/lib/i18n/dictionary";
import { getSettings } from "@/lib/settings";

export default async function PublicShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const settings = await getSettings();

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} siteName={settings.site_name} />
      <div className="flex-1">{children}</div>
      <SiteFooter locale={locale} siteName={settings.site_name} />
    </div>
  );
}
