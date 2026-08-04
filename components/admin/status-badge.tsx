import clsx from "clsx";

const styles: Record<string, string> = {
  draft: "bg-base-900/10 text-base-900/70",
  published: "bg-emerald-100 text-emerald-800",
  reserved: "bg-amber-100 text-amber-800",
  sold: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? "bg-base-900/10"
      )}
    >
      {status}
    </span>
  );
}
