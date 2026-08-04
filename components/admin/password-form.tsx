"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePassword } from "@/actions/profile-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:bg-accent-light disabled:opacity-60"
    >
      {pending ? "Updating…" : "Update password"}
    </button>
  );
}

export default function PasswordForm() {
  const [state, formAction] = useFormState(updatePassword, undefined);
  const field =
    "w-full rounded-lg border border-base-900/10 px-4 py-3 focus:border-accent focus:outline-none";

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="new_password">
          New password
        </label>
        <input id="new_password" name="new_password" type="password" required minLength={8} className={field} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="confirm_password">
          Confirm new password
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          required
          minLength={8}
          className={field}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600" role="alert">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-700">Password updated.</p>}

      <SubmitButton />
    </form>
  );
}
