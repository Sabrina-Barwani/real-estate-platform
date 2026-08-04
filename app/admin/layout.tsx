import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth-actions";

// Middleware already blocks unauthenticated requests to /admin/*, but every
// server action and every layout re-checks independently. Never rely on a
// single choke point for authorization.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-base-900/10 px-6 py-4">
        <span className="font-display text-lg">Admin</span>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-base-900/60 hover:text-base-900"
          >
            Sign out
          </button>
        </form>
      </header>
      <div className="p-6">{children}</div>
    </div>
  );
}
