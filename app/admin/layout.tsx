import Link from "next/link";
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
        <div className="flex items-center gap-6">
          <span className="font-display text-lg">Admin</span>
          <nav className="flex gap-5 text-sm text-base-900/70">
            <Link href="/admin" className="hover:text-accent">Dashboard</Link>
            <Link href="/admin/listings" className="hover:text-accent">Listings</Link>
            <Link href="/admin/settings" className="hover:text-accent">Settings</Link>
            <Link href="/admin/profile" className="hover:text-accent">Profile</Link>
          </nav>
        </div>
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
