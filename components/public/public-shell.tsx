import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";
import type { Locale } from "@/lib/i18n/dictionary";

export default function PublicShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} />
      <div className="flex-1">{children}</div>
      <SiteFooter locale={locale} />
    </div>
  );
}
