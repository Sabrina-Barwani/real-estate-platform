"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ListingFormState } from "@/actions/listing-actions";

type Defaults = {
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  category?: string | null;
  tags?: string[];
  price?: number | null;
  governorate?: string;
  wilayat?: string;
  area?: string;
  land_size?: number | null;
  featured?: boolean;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-light disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export default function ListingForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (state: ListingFormState, formData: FormData) => Promise<ListingFormState>;
  defaults?: Defaults;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, undefined);

  const field =
    "w-full rounded-lg border border-base-900/10 px-4 py-3 focus:border-accent focus:outline-none";
  const label = "mb-1 block text-sm font-medium";

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="title_en">Title (English)</label>
          <input id="title_en" name="title_en" defaultValue={defaults?.title_en} required className={field} />
        </div>
        <div>
          <label className={label} htmlFor="title_ar">Title (Arabic)</label>
          <input id="title_ar" name="title_ar" dir="rtl" defaultValue={defaults?.title_ar} required className={field} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="description_en">Description (English)</label>
          <textarea id="description_en" name="description_en" rows={4} defaultValue={defaults?.description_en} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="description_ar">Description (Arabic)</label>
          <textarea id="description_ar" name="description_ar" dir="rtl" rows={4} defaultValue={defaults?.description_ar} className={field} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={defaults?.category ?? ""} className={field}>
            <option value="">— Select —</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
            <option value="townhouse">Townhouse</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="tags">Tags (comma separated)</label>
          <input id="tags" name="tags" defaultValue={defaults?.tags?.join(", ")} className={field} />
        </div>
      </div>

      <fieldset className="grid gap-4 rounded-lg border border-base-900/10 p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-medium">You fill these in manually</legend>
        <div>
          <label className={label} htmlFor="price">Price (OMR)</label>
          <input id="price" name="price" type="number" step="0.001" defaultValue={defaults?.price ?? undefined} required className={field} />
        </div>
        <div>
          <label className={label} htmlFor="land_size">Land size (m²)</label>
          <input id="land_size" name="land_size" type="number" step="0.01" defaultValue={defaults?.land_size ?? undefined} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="governorate">Governorate</label>
          <input id="governorate" name="governorate" defaultValue={defaults?.governorate} required className={field} />
        </div>
        <div>
          <label className={label} htmlFor="wilayat">Wilayat</label>
          <input id="wilayat" name="wilayat" defaultValue={defaults?.wilayat} required className={field} />
        </div>
        <div>
          <label className={label} htmlFor="area">Area</label>
          <input id="area" name="area" defaultValue={defaults?.area} required className={field} />
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={defaults?.featured}
          className="h-4 w-4 rounded border-base-900/20"
        />
        Feature this listing on the homepage
      </label>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">{state.error}</p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
