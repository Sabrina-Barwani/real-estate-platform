import { createClient } from "@/lib/supabase/server";
import PasswordForm from "@/components/admin/password-form";

export default async function AdminProfilePage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-display">Profile</h1>

      <div className="mb-8 max-w-md rounded-lg border border-base-900/10 p-4">
        <p className="text-xs text-base-900/50">Signed in as</p>
        <p className="font-medium">{session?.user.email}</p>
      </div>

      <h2 className="mb-4 text-lg font-display">Change password</h2>
      <PasswordForm />
    </div>
  );
}
