"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

function sanitizeSingleLine(s: string): string {
  return s
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function IconGear({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconSocial({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 9h4M7 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconWarning({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navItemBase =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium no-underline transition-colors duration-200";

function SidebarNav({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${navItemBase} ${
        active
          ? "bg-[#EEF2FF] text-[#3730A3]"
          : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export function AccountSettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const rawName = user?.displayName?.trim() || user?.email?.split("@")[0] || "Account";
  const displayName = sanitizeSingleLine(rawName);
  const email = user?.email ? sanitizeSingleLine(user.email) : "";

  const isProfile = pathname === "/dashboard/account" || pathname === "/dashboard/account/";
  const isSocial = pathname.startsWith("/dashboard/account/social");
  const isDanger = pathname.startsWith("/dashboard/account/danger");

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 pb-12 pt-6 sm:px-8 md:px-10">
      {/* Profile summary */}
      <div className="mb-8 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F1F5F9] ring-1 ring-[#E2E8F0]">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-full w-full object-cover"
                  width={64}
                  height={64}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/private/user-icon.png"
                  alt=""
                  className="max-h-10 max-w-10 object-contain"
                  width={40}
                  height={40}
                  decoding="async"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-sans text-lg font-semibold text-[#0F172A]">{displayName}</p>
              <p className="mt-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-[#6366F1]">
                Contributor
              </p>
              {email ? (
                <p className="mt-1 truncate font-sans text-sm text-[#64748B]">{email}</p>
              ) : null}
            </div>
          </div>
          <Link
            href="/dashboard/profile"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#6366F1] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#4F46E5] no-underline transition-colors hover:bg-[#EEF2FF] hover:no-underline"
          >
            Editorial profile
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Sidebar */}
        <aside className="w-full shrink-0 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm lg:w-60 xl:w-64">
          <p className="mb-3 px-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
            Account settings
          </p>
          <nav className="flex flex-col gap-1" aria-label="Account settings sections">
            <SidebarNav
              href="/dashboard/account"
              label="Profile settings"
              icon={<IconGear className="shrink-0 text-current opacity-80" />}
              active={isProfile}
            />
            <SidebarNav
              href="/dashboard/account/social"
              label="Social profiles"
              icon={<IconSocial className="shrink-0 text-current opacity-80" />}
              active={isSocial}
            />
            <SidebarNav
              href="/dashboard/account/danger"
              label="Danger zone"
              icon={<IconWarning className="shrink-0 text-current opacity-80" />}
              active={isDanger}
            />
          </nav>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
