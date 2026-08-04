"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  return supabase;
}

export async function updateSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await requireAdmin();

  const siteName = String(formData.get("site_name") ?? "").trim();
  const whatsappNumber = String(formData.get("whatsapp_number") ?? "").trim();

  if (!siteName) {
    return { error: "Site name can't be empty." };
  }
  if (whatsappNumber && !/^\d+$/.test(whatsappNumber)) {
    return { error: "WhatsApp number should be digits only (no +, spaces, or dashes)." };
  }

  const { error } = await supabase
    .from("site_settings")
    .update({ site_name: siteName, whatsapp_number: whatsappNumber })
    .eq("id", 1);

  if (error) {
    return { error: "Could not save settings. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
