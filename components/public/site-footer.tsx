import type { Locale } from "@/lib/i18n/dictionary";
import { t } from "@/lib/i18n/dictionary";
import HorizonMotif from "./horizon-motif";

export default function SiteFooter({ locale, siteName }: { locale: Locale; siteName: string }) {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-base-900/10 py-10 text-center text-sm text-base-900/50">
      <HorizonMotif className="pointer-events-none absolute inset-x-0 -top-6 h-16 w-full text-base-900/10" />
      <p className="relative">
        © {new Date().getFullYear()} {siteName}. {t(locale, "footer_rights")}
      </p>
    </footer>
  );
}
