"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { User } from "firebase/auth";

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96c-.52-.4-1.08-.73-1.69-.98l-.36-2.54a.48.48 0 0 0-.49-.43h-3.84c-.24 0-.45.18-.49.42l-.36 2.54c-.61.25-1.17.59-1.69.98l-2.39-.96a.5.5 0 0 0-.6.22L2.74 8.84c-.14.23-.09.52.12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.12.22.37.31.6.22l2.39-.96c.52.4 1.08.73 1.69.98l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .44-.18.49-.42l.36-2.54c.61-.25 1.17-.59 1.69-.98l2.39.96c.23.09.48 0 .6-.22l1.92-3.32c.12-.22.07-.51-.12-.64l-2.01-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconCard({ className }: { className?: string }) {
  return (
    <svg className={className} width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2Zm0 14H4v-6h16v6Zm0-10H4V6h16v2Z"
        fill="currentColor"
      />
    </svg>
  );
}

type Props = {
  user: User;
  onSignOut: () => Promise<void>;
  /** `headerIcon`: 44×44 circle + generic avatar only (no username in header). */
  triggerVariant?: "icon" | "pill" | "headerIcon";
};

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProfileDropdown({ user, onSignOut, triggerVariant = "icon" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const displayName = user.displayName?.trim() || user.email?.split("@")[0] || "Reader";
  const email = user.email ?? "";

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
    "flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm font-medium text-[#111827] no-underline outline-none transition-colors hover:bg-[#F3F4F6] focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-1";

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
      {displayName.charAt(0).toUpperCase()}
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
          triggerVariant === "headerIcon"
            ? "relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#F3F4F6] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
            : triggerVariant === "pill"
              ? "relative flex h-11 max-w-[220px] shrink-0 items-center gap-2.5 rounded-full border border-[#E5E7EB] bg-white py-1 pl-1 pr-2.5 text-left shadow-sm transition-colors hover:border-[#D1D5DB] hover:bg-[#F9FAFB] focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              : "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
        }
        aria-label="Open account menu"
      >
        {triggerVariant === "headerIcon" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/private/user-icon.png"
            alt=""
            className="h-7 w-7 object-contain"
            width={28}
            height={28}
          />
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
                <span className="min-w-0 flex-1 truncate font-sans text-sm font-medium text-[#111827]">
                  {displayName}
                </span>
                <ChevronDown className="shrink-0 text-[#6B7280]" />
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
          className="profile-dropdown-panel absolute right-0 top-full z-[1000] mt-2 w-[280px] origin-top-right rounded-xl border border-[#E5E7EB]/80 bg-white p-3 shadow-[0_10px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03]"
        >
          <div className="flex h-14 items-center gap-3 px-0.5">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-stone-200">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" className="h-full w-full object-cover" width={36} height={36} />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-sans text-sm font-semibold text-stone-600">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm font-medium leading-tight text-[#111827]">{displayName}</p>
              {email ? (
                <p className="truncate font-sans text-xs leading-tight text-[#6B7280]">{email}</p>
              ) : null}
            </div>
          </div>

          <div className="my-2 h-px bg-[#E5E7EB]" role="separator" />

          <div className="flex flex-col gap-1">
            <Link
              href="/dashboard/profile"
              role="menuitem"
              className={itemClass}
              onClick={close}
            >
              <IconUser className="shrink-0 text-[#6B7280]" />
              Profile
            </Link>
            <Link
              href="/dashboard/account"
              role="menuitem"
              className={itemClass}
              onClick={close}
            >
              <IconSettings className="shrink-0 text-[#6B7280]" />
              Account Settings
            </Link>
            <Link
              href="/dashboard/billing"
              role="menuitem"
              className={itemClass}
              onClick={close}
            >
              <IconCard className="shrink-0 text-[#6B7280]" />
              Billing and Plans
            </Link>
          </div>

          <div className="my-2 h-px bg-[#E5E7EB]" role="separator" />

          <button
            type="button"
            role="menuitem"
            className={`${itemClass} text-[#DC2626] hover:bg-[#FEF2F2] focus-visible:ring-red-300`}
            onClick={() => void handleSignOut()}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
