import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-display">Settings</h1>
      <SettingsForm defaults={settings} />
    </div>
  );
}
