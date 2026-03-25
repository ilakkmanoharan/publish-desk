"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "firebase/auth";
import { ProfileDropdown } from "@/components/profile-dropdown";

function navActive(pathname: string) {
  return {
    magazines: pathname === "/" || pathname.startsWith("/magazines"),
    dashboard: pathname.startsWith("/dashboard/magazines"),
    articles:
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/content") ||
      pathname.startsWith("/dashboard/schedule") ||
      pathname.startsWith("/dashboard/source") ||
      pathname.startsWith("/dashboard/profile") ||
      pathname.startsWith("/dashboard/account") ||
      pathname.startsWith("/dashboard/billing"),
    analytics: pathname.startsWith("/dashboard/analytics"),
  };
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex h-[72px] shrink-0 items-center border-b-2 font-sans text-[15px] font-medium no-underline transition-colors ${
        active
          ? "border-indigo-500 text-[#111827]"
          : "border-transparent text-[#374151] hover:text-[#111827]"
      }`}
    >
      {children}
    </Link>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[#374151] transition-colors hover:bg-[#F3F4F6] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
    >
      {children}
    </button>
  );
}

/** Inner column: max 1200px + 24px side padding creates visible viewport gutters. */
const HEADER_INNER =
  "mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-6";

type Props = {
  leftSlot?: React.ReactNode;
  /** Extra controls before search (e.g. “← All magazines”) */
  rightSlot?: React.ReactNode;
  user: User | null;
  authLoading: boolean;
  signOut: () => Promise<void>;
};

export function SiteAppHeader({ leftSlot, rightSlot, user, authLoading, signOut }: Props) {
  const pathname = usePathname() ?? "";
  const a = navActive(pathname);

  return (
    <header className="sticky top-0 z-[100] h-[72px] w-full shrink-0 border-b border-[#E5E7EB] bg-white">
      <div className={HEADER_INNER}>
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link
            href="/"
            className="shrink-0 font-display text-[20px] font-semibold leading-none text-[#111827] no-underline transition-opacity hover:opacity-80"
          >
            Publish Desk
          </Link>
          {leftSlot}
        </div>

        <nav
          className="hidden min-w-0 flex-none items-center gap-7 lg:flex"
          aria-label="Primary"
        >
          <NavLink href="/dashboard/magazines" active={a.dashboard}>
            Dashboard
          </NavLink>
          <NavLink href="/" active={a.magazines}>
            Magazines
          </NavLink>
          <NavLink href="/dashboard" active={a.articles}>
            Articles
          </NavLink>
          <NavLink href="/dashboard/analytics" active={a.analytics}>
            Analytics
          </NavLink>
        </nav>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
          {rightSlot}
          <label className="hidden max-w-[280px] flex-1 md:block lg:max-w-[280px]">
            <span className="sr-only">Search</span>
            <input
              type="search"
              placeholder="Search…"
              className="h-10 w-full min-w-[120px] rounded-[10px] border-0 bg-[#F9FAFB] px-3 font-sans text-sm text-[#374151] placeholder:text-[#9CA3AF] outline-none ring-1 ring-transparent transition-shadow focus:ring-2 focus:ring-indigo-500/35"
            />
          </label>
          {user ? (
            <>
              <div className="hidden items-center gap-3 sm:flex">
                <IconButton label="Notifications">
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
                <IconButton label="Toggle theme">
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
              </div>
              <ProfileDropdown user={user} onSignOut={signOut} triggerVariant="headerIcon" />
            </>
          ) : authLoading ? (
            <span className="font-sans text-sm text-[#6B7280]">Loading…</span>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2.5 font-sans text-sm font-medium text-[#374151] no-underline transition-colors hover:bg-[#F3F4F6]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[#111827] px-4 py-2.5 font-sans text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
