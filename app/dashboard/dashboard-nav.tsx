"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ProfileDropdown } from "@/components/profile-dropdown";

function isDashboardHomeActive(pathname: string) {
  return pathname === "/dashboard" || pathname === "/dashboard/";
}

function isContentActive(pathname: string) {
  return pathname.startsWith("/dashboard/content");
}

function isMagazinesActive(pathname: string) {
  return pathname.startsWith("/dashboard/magazines");
}

function isProfileHubActive(pathname: string) {
  return (
    pathname.startsWith("/dashboard/profile") ||
    pathname.startsWith("/dashboard/account") ||
    pathname.startsWith("/dashboard/billing")
  );
}

function isScheduleActive(pathname: string) {
  return pathname.startsWith("/dashboard/schedule");
}

function isSourceActive(pathname: string) {
  return pathname.startsWith("/dashboard/source");
}

const navLinkClass =
  "inline-flex w-fit max-w-none rounded-md px-3 py-2 text-[15px] font-medium leading-none text-[#D1D5DB] whitespace-nowrap no-underline transition-colors duration-200 ease-in-out hover:bg-white/[0.06] hover:text-white hover:no-underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500/50";

type NavItemProps = {
  href: string;
  label: string;
  active: boolean;
};

/** Each entry is an isolated flex child — never concatenated with siblings. */
function NavItem({ href, label, active }: NavItemProps) {
  return (
    <div className="nav-item w-fit shrink-0 whitespace-nowrap">
      <Link
        href={href}
        className={`${navLinkClass} ${active ? "bg-white/[0.06] text-white" : ""}`}
      >
        {label}
      </Link>
    </div>
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

  if (!user) return null;

  return (
    <header className="dashboard-header-premium sticky top-0 z-50 h-16 w-full shrink-0 border-b border-white/[0.06] bg-[#0B0B0C]/80 font-sans shadow-[0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md supports-[backdrop-filter]:bg-[#0B0B0C]/75">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-8">
        <Link
          href="/dashboard"
          className="shrink-0 text-[18px] font-semibold leading-none tracking-[0.35px] text-white no-underline transition-opacity duration-200 hover:opacity-90 hover:no-underline"
          aria-current={isDashboardHomeActive(pathname) ? "page" : undefined}
        >
          Publish Desk
        </Link>

        <nav
          className="flex min-h-0 min-w-0 flex-1 items-center justify-center gap-[40px] overflow-x-auto [-webkit-overflow-scrolling:touch] px-4"
          aria-label="Dashboard"
        >
          <NavItem href="/dashboard/content" label="Content" active={isContentActive(pathname)} />
          <NavItem href="/dashboard/magazines" label="Magazines" active={isMagazinesActive(pathname)} />
          <NavItem href="/dashboard/profile" label="Profile" active={isProfileHubActive(pathname)} />
          <NavItem href="/dashboard/schedule" label="Schedule" active={isScheduleActive(pathname)} />
          <NavItem href="/dashboard/source" label="Content source" active={isSourceActive(pathname)} />
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/"
            className="shrink-0 whitespace-nowrap text-[14px] font-medium leading-none text-[#9CA3AF] no-underline transition-colors duration-200 hover:text-white hover:no-underline"
          >
            View site
          </Link>
          <ProfileDropdown
            user={user}
            onSignOut={handleSignOut}
            triggerVariant="headerIcon"
            headerAppearance="dark"
          />
        </div>
      </div>
    </header>
  );
}
