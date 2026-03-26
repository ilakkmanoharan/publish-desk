"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";

function sanitizeSingleLine(s: string): string {
  return s
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block font-sans text-xs font-semibold text-[#374151]">{children}</label>;
}

function Helper({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 font-sans text-xs leading-relaxed text-[#64748B]">{children}</p>;
}

const inputClass =
  "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 font-sans text-sm text-[#0F172A] shadow-sm transition-colors placeholder:text-[#94A3B8] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 disabled:cursor-not-allowed disabled:bg-[#F8FAFC]";

export default function AccountProfileSettingsPage() {
  const { user } = useAuth();

  const displayName = user?.displayName ? sanitizeSingleLine(user.displayName) : "";
  const email = user?.email ? sanitizeSingleLine(user.email) : "";
  const usernameGuess = email ? sanitizeSingleLine(email.split("@")[0] || "") : "";

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="border-b border-[#E2E8F0] px-6 py-5 sm:px-8">
        <h1 className="font-sans text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">Profile details</h1>
        <p className="mt-1.5 font-sans text-sm text-[#64748B]">
          You have full control to manage your own account settings.
        </p>
      </div>

      <div className="px-6 py-6 sm:px-8">
        {/* Avatar */}
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F1F5F9] ring-1 ring-[#E2E8F0]">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-full w-full object-cover"
                  width={80}
                  height={80}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/private/user-icon.png"
                  alt=""
                  className="max-h-12 max-w-12 object-contain"
                  width={48}
                  height={48}
                  decoding="async"
                />
              )}
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-[#0F172A]">Your avatar</p>
              <p className="mt-1 max-w-md font-sans text-xs leading-relaxed text-[#64748B]">
                PNG or JPG/JPEG, at least 200×200px, max 1MB. Upload is coming soon.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="shrink-0 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 font-sans text-sm font-medium text-[#64748B] shadow-sm disabled:cursor-not-allowed"
          >
            Update
          </button>
        </div>

        {/* Personal details */}
        <div className="pt-8">
          <h2 className="font-sans text-base font-bold text-[#0F172A]">Personal details</h2>
          <p className="mt-1 font-sans text-sm text-[#64748B]">
            Update your personal details and email address. Some fields are managed by your sign-in provider.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <FieldLabel>Username</FieldLabel>
              <input
                type="text"
                readOnly
                value={usernameGuess}
                className={inputClass}
                placeholder="username"
              />
              <Helper>Choose how your public profile link will look like.</Helper>
            </div>
            <div className="sm:col-span-1">
              <FieldLabel>Name</FieldLabel>
              <input
                type="text"
                readOnly
                value={displayName}
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>
            <div className="sm:col-span-1">
              <FieldLabel>Email</FieldLabel>
              <input type="email" readOnly value={email} className={inputClass} placeholder="you@example.com" />
              <Helper>Primary email used for account login and communications.</Helper>
            </div>
            <div className="sm:col-span-1">
              <FieldLabel>Recovery email</FieldLabel>
              <input
                type="email"
                disabled
                className={inputClass}
                placeholder="Enter your recovery email"
              />
              <Helper>Designated for recovery purposes only — not available yet.</Helper>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Headline</FieldLabel>
              <input type="text" disabled className={inputClass} placeholder="Enter a headline" />
            </div>
            <div className="sm:col-span-1">
              <FieldLabel>Country</FieldLabel>
              <select disabled className={inputClass} defaultValue="us">
                <option value="us">United States</option>
              </select>
              <Helper>This field is read-only for now.</Helper>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              disabled
              className="rounded-lg bg-[#4F46E5] px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              Update profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
