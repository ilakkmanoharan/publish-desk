"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { User } from "firebase/auth";

/** One visible line of text — avoids stray lines (e.g. newlines in displayName). */
function sanitizeSingleLine(s: string): string {
  return s
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
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

function IconCard({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconPower({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M18.36 6.64a9 9 0 1 1-12.73 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Props = {
  user: User;
  onSignOut: () => Promise<void>;
  triggerVariant?: "icon" | "pill" | "headerIcon";
  /** Dark dashboard header: 40px bordered avatar + hover ring */
  headerAppearance?: "default" | "dark";
};

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProfileDropdown({
  user,
  onSignOut,
  triggerVariant = "icon",
  headerAppearance = "default",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const rawName = user.displayName?.trim() || user.email?.split("@")[0] || "Reader";
  const displayName = sanitizeSingleLine(rawName);
  const email = user.email ? sanitizeSingleLine(user.email) : "";
  const initial = displayName.charAt(0).toLocaleUpperCase("en-US");

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    if (!menu) return;
    const focusables = menu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const list = Array.from(focusables);
    if (list.length) list[0]?.focus();

    const onMenuKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault();
      const i = list.indexOf(document.activeElement as HTMLElement);
      let next = 0;
      if (e.key === "ArrowDown") next = i < 0 ? 0 : Math.min(i + 1, list.length - 1);
      else if (e.key === "ArrowUp") next = i <= 0 ? list.length - 1 : i - 1;
      else if (e.key === "Home") next = 0;
      else next = list.length - 1;
      list[next]?.focus();
    };
    menu.addEventListener("keydown", onMenuKey);
    return () => menu.removeEventListener("keydown", onMenuKey);
  }, [open]);

  async function handleSignOut() {
    close();
    await onSignOut();
  }

  const itemClass =
    "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium text-[#374151] no-underline outline-none transition-colors hover:bg-[#F3F4F6] hover:text-[#111827] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0";

  const avatarInner = user.photoURL ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.photoURL}
      alt=""
      className="h-9 w-9 rounded-full object-cover"
      width={36}
      height={36}
    />
  ) : (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 font-sans text-sm font-semibold text-stone-700">
      {initial}
    </span>
  );

  return (
    <div ref={rootRef} className="relative z-[1000]">
      <button
        ref={triggerRef}
        type="button"
        id={`${menuId}-trigger`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? `${menuId}-menu` : undefined}
        onClick={() => setOpen((v) => !v)}
        className={
          triggerVariant === "headerIcon" && headerAppearance === "dark"
            ? "relative box-border flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-[#1F2937] p-1 transition-all duration-200 ease-in-out hover:border-white/90 hover:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-0 focus-visible:ring-offset-[#0B0B0C]"
            : triggerVariant === "headerIcon"
              ? "relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-colors hover:bg-[#F3F4F6] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2"
            : triggerVariant === "pill"
              ? "relative flex h-11 max-w-[220px] shrink-0 items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 text-left shadow-sm transition-colors hover:bg-stone-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
              : "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted transition hover:bg-stone-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
        }
        aria-label="Open account menu"
      >
        {triggerVariant === "headerIcon" ? (
          <span className="relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/private/user-icon.png"
              alt=""
              className="max-h-full max-w-full object-contain"
              width={28}
              height={28}
              decoding="async"
            />
            {headerAppearance === "default" ? (
              <span
                className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                aria-hidden
              />
            ) : null}
          </span>
        ) : (
          <>
            <span className="relative shrink-0">
              {avatarInner}
              <span
                className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                aria-hidden
                title="Online"
              />
            </span>
            {triggerVariant === "pill" ? (
              <>
                <span className="min-w-0 flex-1 truncate font-sans text-sm font-medium text-foreground">
                  {displayName}
                </span>
                <ChevronDown className="shrink-0 text-muted" />
              </>
            ) : null}
          </>
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          id={`${menuId}-menu`}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="profile-dropdown-panel absolute right-0 top-full z-[1000] mt-2 w-[280px] max-w-[min(280px,100vw-1.5rem)] origin-top-right overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-4 font-sans shadow-[0_4px_24px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)] [&_a]:no-underline [&_a:hover]:no-underline [&_a:focus-visible]:outline-none"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB] ring-1 ring-[#E5E7EB]">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-full min-h-0 w-full min-w-0 object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/private/user-icon.png"
                  alt=""
                  className="max-h-7 max-w-7 object-contain"
                  width={28}
                  height={28}
                  decoding="async"
                />
              )}
              <span
                className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold leading-5 text-[#111827]">{displayName}</p>
              {email ? (
                <p className="truncate text-xs leading-4 text-[#6B7280]">{email}</p>
              ) : null}
            </div>
          </div>

          <div className="my-3 h-px bg-[#E5E7EB]" role="separator" />

          <div className="flex flex-col gap-2">
            <Link href="/dashboard/profile" role="menuitem" className={itemClass} onClick={close}>
              <IconUser className="shrink-0 text-[#9CA3AF]" />
              Profile
            </Link>
            <Link href="/dashboard/account" role="menuitem" className={itemClass} onClick={close}>
              <IconSettings className="shrink-0 text-[#9CA3AF]" />
              Account Settings
            </Link>
            <Link href="/dashboard/billing" role="menuitem" className={itemClass} onClick={close}>
              <IconCard className="shrink-0 text-[#9CA3AF]" />
              Billing and Plans
            </Link>
          </div>

          <div className="my-3 h-px bg-[#E5E7EB]" role="separator" />

          <button
            type="button"
            role="menuitem"
            className={`${itemClass} text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#DC2626] focus-visible:ring-red-400`}
            onClick={() => void handleSignOut()}
          >
            <IconPower className="shrink-0 text-[#EF4444]" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
