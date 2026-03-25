"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ProfileDropdown } from "@/components/profile-dropdown";

function isContentActive(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/content");
}

function isMagazinesActive(pathname: string) {
  return pathname.startsWith("/dashboard/magazines");
}

/** Profile hub + account routes linked from the user menu. */
function isProfileHubActive(pathname: string) {
  return (
    pathname.startsWith("/dashboard/profile") ||
    pathname.startsWith("/dashboard/schedule") ||
    pathname.startsWith("/dashboard/source") ||
    pathname.startsWith("/dashboard/account") ||
    pathname.startsWith("/dashboard/billing")
  );
}

export function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const navItem = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={`inline-flex h-[72px] items-center border-b-2 px-3 text-[15px] font-medium no-underline transition-colors ${
        active
          ? "border-accent text-accent"
          : "border-transparent text-[#374151] hover:text-[#111827]"
      }`}
    >
      {label}
    </Link>
  );

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 h-[72px] w-full shrink-0 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto">
          <Link
            href="/dashboard"
            className="shrink-0 font-display text-xl font-semibold text-accent no-underline transition-opacity hover:opacity-90"
          >
            Publish Desk
          </Link>
          <nav className="flex shrink-0 items-center gap-1 font-sans" aria-label="Dashboard">
            {navItem("/dashboard", "Content", isContentActive(pathname))}
            {navItem("/dashboard/magazines", "Magazines", isMagazinesActive(pathname))}
            {navItem("/dashboard/profile", "Profile", isProfileHubActive(pathname))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-4 font-sans">
          <Link
            href="/"
            className="text-[15px] font-medium text-[#374151] no-underline transition-colors hover:text-[#111827]"
          >
            View site
          </Link>
          <ProfileDropdown user={user} onSignOut={handleSignOut} triggerVariant="headerIcon" />
        </div>
      </div>
    </header>
  );
}
