import Link from "next/link";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n/dictionary";
import { t } from "@/lib/i18n/dictionary";

type Props = {
  slug: string;
  title: string;
  reference: string;
  price: number | null;
  wilayat: string | null;
  governorate: string | null;
  status: string;
  coverUrl: string | null;
  locale: Locale;
};

const statusStyles: Record<string, string> = {
  reserved: "bg-amber-100 text-amber-800",
  sold: "bg-red-100 text-red-800",
};

export default function PropertyCard({
  slug,
  title,
  reference,
  price,
  wilayat,
  governorate,
  status,
  coverUrl,
  locale,
}: Props) {
  return (
    <Link
      href={`/properties/${slug}`}
      className="group block overflow-hidden rounded-3xl border border-base-900/10 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-base-900/5">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-base-900/5 to-base-900/[0.02] text-sm text-base-900/35">
            {t(locale, "no_photo")}
          </div>
        )}
        {status !== "published" && (
          <span
            className={clsx(
              "absolute end-3 top-3 rounded-full px-3 py-1 text-xs font-medium capitalize",
              statusStyles[status] ?? "bg-base-900/10"
            )}
          >
            {status}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="mb-1 font-mono text-[11px] tracking-wide text-base-900/35">{reference}</p>
        <h3 className="font-display text-lg leading-snug">{title}</h3>
        <p className="mt-1 text-sm text-base-900/50">
          {[wilayat, governorate].filter(Boolean).join(", ")}
        </p>
        {price && (
          <p className="mt-3 font-display text-lg text-gold">OMR {price.toLocaleString()}</p>
        )}
      </div>
    </Link>
  );
}
