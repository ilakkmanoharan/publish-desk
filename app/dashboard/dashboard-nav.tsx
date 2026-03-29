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

function isScheduleActive(pathname: string) {
  return pathname.startsWith("/dashboard/schedule");
}

function isSourceActive(pathname: string) {
  return pathname.startsWith("/dashboard/source");
}

type NavItemProps = {
  href: string;
  label: string;
  active: boolean;
};

/** Primary workspace nav — gap lives on parent `.nav-menu`; no merged labels. */
function NavItem({ href, label, active }: NavItemProps) {
  return (
    <div className="nav-item min-w-max shrink-0 whitespace-nowrap">
      <Link
        href={href}
        className={`inline-flex max-w-none items-center whitespace-nowrap border-b-2 border-transparent px-0.5 pb-3 text-[15px] font-medium leading-none tracking-[0.3px] text-[#A8A29E] no-underline transition-[color,border-color,opacity] duration-200 ease-in-out focus-visible:outline focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0C] md:text-base ${
          active
            ? "border-accent text-white"
            : "hover:border-white/30 hover:text-white"
        }`}
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
    <header className="dashboard-header-premium sticky top-0 z-50 h-[68px] w-full shrink-0 border-b border-white/[0.08] bg-[#0B0B0C]/90 font-sans shadow-[0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-md supports-[backdrop-filter]:bg-[#0B0B0C]/82">
      <div className="mx-auto flex h-[68px] w-full max-w-[1280px] items-center gap-6 px-8 lg:px-12">
        {/* Left: brand */}
        <div className="flex min-w-0 flex-1 basis-0 items-center justify-start">
          <Link
            href="/dashboard"
            className="font-display text-lg font-semibold leading-none tracking-tight text-accent no-underline transition-opacity duration-200 hover:opacity-90 hover:no-underline sm:text-[1.35rem]"
            aria-current={isDashboardHomeActive(pathname) ? "page" : undefined}
          >
            Publish Desk
          </Link>
        </div>

        {/* Center: primary nav — flex gap 32px (min) / 40px (preferred) */}
        <nav
          className="nav-menu flex min-w-0 shrink-0 flex-nowrap items-center justify-center overflow-x-auto [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
          style={{ scrollbarWidth: "none" }}
          aria-label="Workspace"
        >
          <NavItem href="/dashboard/content" label="Content" active={isContentActive(pathname)} />
          <NavItem href="/dashboard/magazines" label="Magazines" active={isMagazinesActive(pathname)} />
          <NavItem href="/dashboard/schedule" label="Schedule" active={isScheduleActive(pathname)} />
          <NavItem href="/dashboard/source" label="Sources" active={isSourceActive(pathname)} />
        </nav>

        {/* Right: utilities — gap 16–20px, vertically centered */}
        <div className="right-section min-w-0 flex-1 basis-0">
          <Link
            href="/"
            className="inline-flex h-9 shrink-0 items-center rounded-md border border-white/12 bg-transparent px-3.5 py-2 text-[13px] font-medium leading-none tracking-[0.3px] text-[#9CA3AF] no-underline transition-colors duration-200 hover:border-white/22 hover:bg-white/[0.05] hover:text-[#E7E5E4] hover:no-underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0C]"
          >
            View Site
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
