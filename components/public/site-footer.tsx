import type { Locale } from "@/lib/i18n/dictionary";
import { t } from "@/lib/i18n/dictionary";

export default function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-20 border-t border-base-900/10 py-8 text-center text-sm text-base-900/50">
      © {new Date().getFullYear()} Real Estate. {t(locale, "footer_rights")}
    </footer>
  );
}
