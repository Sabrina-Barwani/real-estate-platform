"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateSettings } from "@/actions/settings-actions";
import type { SiteSettings } from "@/lib/settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-light disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}

export default function SettingsForm({ defaults }: { defaults: SiteSettings }) {
  const [state, formAction] = useFormState(updateSettings, undefined);
  const field =
    "w-full rounded-lg border border-base-900/10 px-4 py-3 focus:border-accent focus:outline-none";

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="site_name">
          Site name
        </label>
        <input id="site_name" name="site_name" defaultValue={defaults.site_name} required className={field} />
        <p className="mt-1 text-xs text-base-900/50">Shown in the header and footer of the public site.</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="whatsapp_number">
          WhatsApp number
        </label>
        <input
          id="whatsapp_number"
          name="whatsapp_number"
          defaultValue={defaults.whatsapp_number}
          placeholder="96891234567"
          className={field}
        />
        <p className="mt-1 text-xs text-base-900/50">
          International format, digits only — no +, spaces, or dashes.
        </p>
      </div>

      {state?.error && <p className="text-sm text-red-600" role="alert">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-700">Settings saved.</p>}

      <SubmitButton />
    </form>
  );
}
