"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const navLink = (href: string, label: string) => {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive ? "bg-neutral-100 text-foreground font-medium" : "text-muted hover:text-foreground hover:bg-neutral-50"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-10 w-56 h-full bg-card border-r border-border p-4 flex flex-col gap-4">
      <Link href="/" className="text-lg font-semibold text-accent hover:opacity-90">
        Publish Desk
      </Link>
      <nav className="flex flex-col gap-1">
        {navLink("/dashboard", "Content")}
        {navLink("/dashboard/magazines", "Magazines")}
        {navLink("/dashboard/schedule", "Schedule")}
        {navLink("/dashboard/source", "Content source")}
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left text-sm text-muted hover:text-foreground hover:bg-neutral-50 px-3 py-2 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
