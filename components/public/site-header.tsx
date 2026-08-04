import Link from "next/link";
import type { Locale } from "@/lib/i18n/dictionary";
import { t } from "@/lib/i18n/dictionary";
import LocaleSwitch from "./locale-switch";

export default function SiteHeader({ locale, siteName }: { locale: Locale; siteName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-base-900/10 bg-base-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="font-display text-xl tracking-tight">
          {siteName}
        </Link>
        <nav className="flex items-center gap-7 text-sm">
          <Link href="/properties" className="text-base-900/70 transition hover:text-accent">
            {t(locale, "nav_properties")}
          </Link>
          <Link href="/about" className="text-base-900/70 transition hover:text-accent">
            {t(locale, "nav_about")}
          </Link>
          <Link href="/contact" className="text-base-900/70 transition hover:text-accent">
            {t(locale, "nav_contact")}
          </Link>
          <LocaleSwitch locale={locale} />
        </nav>
      </div>
    </header>
  );
}
