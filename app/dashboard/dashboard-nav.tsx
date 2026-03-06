"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function DashboardNav() {
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 w-56 h-full border-r border-border p-4 flex flex-col gap-4">
      <Link href="/" className="text-lg font-semibold text-accent">
        Publish Desk
      </Link>
      <nav className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="text-muted hover:text-foreground px-3 py-2 rounded"
        >
          Content
        </Link>
        <Link
          href="/dashboard/magazines"
          className="text-muted hover:text-foreground px-3 py-2 rounded"
        >
          Magazines
        </Link>
        <Link
          href="/dashboard/schedule"
          className="text-muted hover:text-foreground px-3 py-2 rounded"
        >
          Schedule
        </Link>
        <Link
          href="/dashboard/source"
          className="text-muted hover:text-foreground px-3 py-2 rounded"
        >
          Content source
        </Link>
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left text-sm text-muted hover:text-foreground px-3 py-2 rounded"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
