import Link from "next/link";
import type { Locale } from "@/lib/i18n/dictionary";
import { t } from "@/lib/i18n/dictionary";
import LocaleSwitch from "./locale-switch";

export default function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="border-b border-base-900/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="font-display text-xl">
          Real Estate
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/properties" className="hover:text-accent">{t(locale, "nav_properties")}</Link>
          <Link href="/about" className="hover:text-accent">{t(locale, "nav_about")}</Link>
          <Link href="/contact" className="hover:text-accent">{t(locale, "nav_contact")}</Link>
          <LocaleSwitch locale={locale} />
        </nav>
      </div>
    </header>
  );
}
