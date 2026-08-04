import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Session-aware client for use in Server Components / Server Actions.
// Respects RLS as the currently logged-in user (admin or anon).
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component with no request context — safe to ignore,
            // middleware refreshes the session on the next request.
          }
        },
        remove: (name, options) => {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // See note above.
          }
        },
      },
    }
  );
}

// Privileged client — bypasses RLS entirely. Import ONLY inside server actions
// that have already verified the caller is the admin. Never import this in
// any file reachable from a Client Component.
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { get: () => undefined, set: () => {}, remove: () => {} },
    }
  );
}
