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

function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHelpCircle({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const navLinkClass =
  "inline-flex w-fit max-w-none rounded-md px-3 py-2 text-[15px] font-medium leading-none text-[#D1D5DB] whitespace-nowrap no-underline transition-colors duration-200 ease-in-out hover:bg-white/[0.06] hover:text-white hover:no-underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500/50";

const iconHit =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9CA3AF] transition-colors duration-200 ease-in-out hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500/50";

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
        >
          Publish Desk
        </Link>

        <nav
          className="flex min-h-0 min-w-0 flex-1 items-center justify-center gap-[40px] overflow-x-auto [-webkit-overflow-scrolling:touch] px-4"
          aria-label="Dashboard"
        >
          <NavItem href="/dashboard" label="Content" active={isContentActive(pathname)} />
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
          <button type="button" className={iconHit} aria-label="Notifications">
            <IconBell className="shrink-0" />
          </button>
          <button type="button" className={iconHit} aria-label="Help">
            <IconHelpCircle className="shrink-0" />
          </button>
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
