import { createClient } from "@/lib/supabase/server";

export type SiteSettings = {
  site_name: string;
  whatsapp_number: string;
};

const DEFAULTS: SiteSettings = { site_name: "Real Estate", whatsapp_number: "" };

// Reads the single settings row. Falls back to defaults if the migration
// hasn't been run yet or the row is somehow missing — never throws, since
// a settings lookup failure shouldn't take down the whole public site.
export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("site_name, whatsapp_number")
      .eq("id", 1)
      .single();

    if (!data) return DEFAULTS;
    return {
      site_name: data.site_name || DEFAULTS.site_name,
      whatsapp_number: data.whatsapp_number || DEFAULTS.whatsapp_number,
    };
  } catch {
    return DEFAULTS;
  }
}
