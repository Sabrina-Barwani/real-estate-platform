import type { Locale } from "@/lib/i18n/dictionary";
import { t } from "@/lib/i18n/dictionary";

export default function FilterBar({
  defaults,
  locale,
}: {
  defaults: { q?: string; governorate?: string; category?: string };
  locale: Locale;
}) {
  const field =
    "rounded-lg border border-base-900/10 px-4 py-2.5 text-sm focus:border-accent focus:outline-none";

  return (
    <form method="get" className="flex flex-wrap gap-3">
      <input
        type="text"
        name="q"
        placeholder={t(locale, "search_placeholder")}
        defaultValue={defaults.q}
        className={`${field} flex-1 min-w-[200px]`}
      />
      <input
        type="text"
        name="governorate"
        placeholder={t(locale, "governorate_placeholder")}
        defaultValue={defaults.governorate}
        className={field}
      />
      <select name="category" defaultValue={defaults.category ?? ""} className={field}>
        <option value="">{t(locale, "all_categories")}</option>
        <option value="villa">Villa</option>
        <option value="apartment">Apartment</option>
        <option value="land">Land</option>
        <option value="commercial">Commercial</option>
        <option value="townhouse">Townhouse</option>
      </select>
      <button
        type="submit"
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-light"
      >
        {t(locale, "search_button")}
      </button>
    </form>
  );
}
