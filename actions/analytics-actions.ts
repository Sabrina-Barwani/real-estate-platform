"use server";

import { createAdminClient } from "@/lib/supabase/server";

// Called from the public property detail page. Uses the privileged client
// since anonymous visitors have no write access to properties otherwise —
// this function does exactly one fixed thing (see the SQL function itself),
// so it doesn't widen what a visitor can actually do.
export async function trackPropertyView(propertyId: string) {
  try {
    const supabase = createAdminClient();
    await supabase.rpc("increment_property_view", { prop_id: propertyId });
  } catch {
    // Never let analytics break the page for a visitor.
  }
}
