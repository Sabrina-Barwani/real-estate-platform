import { createBrowserClient } from "@supabase/ssr";

// Safe for client components — uses the public anon key only.
// RLS policies (not this file) are what actually enforce access control.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
