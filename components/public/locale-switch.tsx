"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/dictionary";

export default function LocaleSwitch({ locale }: { locale: Locale }) {
  const router = useRouter();

  function switchTo(next: Locale) {
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => switchTo("en")}
        className={locale === "en" ? "font-medium text-accent" : "text-base-900/50"}
      >
        EN
      </button>
      <span className="text-base-900/30">/</span>
      <button
        onClick={() => switchTo("ar")}
        className={locale === "ar" ? "font-medium text-accent" : "text-base-900/50"}
      >
        AR
      </button>
    </div>
  );
}
