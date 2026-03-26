"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/contexts/auth-context";
import { formatAvatarUploadFailure, formatUserFacingFirebaseError } from "@/lib/firebase/user-facing-error";
import {
  PROFILE_AVATAR_MAX_BYTES,
  formatFileSizeForDisplay,
  getProfileImageValidationError,
  uploadUserProfilePhoto,
} from "@/lib/storage";
import { getUserProfileDocument, saveUserProfileDocument } from "@/lib/user-profile";

function sanitizeSingleLine(s: string): string {
  return s
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function emailLocalPart(email: string): string {
  const i = email.indexOf("@");
  return i > 0 ? sanitizeSingleLine(email.slice(0, i)) : sanitizeSingleLine(email);
}

const USERNAME_RE = /^[a-zA-Z0-9_-]{1,40}$/;

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-sans text-xs font-semibold text-[#374151]">
      {children}
    </label>
  );
}

function Helper({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 font-sans text-xs leading-relaxed text-[#64748B]">{children}</p>;
}

const inputClass =
  "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 font-sans text-sm text-[#0F172A] shadow-sm transition-colors placeholder:text-[#94A3B8] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 read-only:bg-[#F8FAFC] read-only:text-[#64748B]";

export default function AccountProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [country, setCountry] = useState("us");

  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarStep, setAvatarStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const email = user?.email ? sanitizeSingleLine(user.email) : "";

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    setError(null);
    try {
      const doc = await getUserProfileDocument(user.uid);
      const local = email ? emailLocalPart(email) : "";
      setUsername(sanitizeSingleLine(doc?.username ?? local));
      setFullName(sanitizeSingleLine(doc?.fullName ?? user.displayName ?? ""));
      setRecoveryEmail(doc?.recoveryEmail ? sanitizeSingleLine(doc.recoveryEmail) : "");
      setHeadline(doc?.headline ? sanitizeSingleLine(doc.headline) : "");
      setCountry(doc?.country && doc.country.length > 0 ? doc.country : "us");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load profile.");
    } finally {
      setProfileLoading(false);
    }
  }, [user, email]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const showMessage = (msg: string) => {
    setError(null);
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const onPickAvatar = () => fileInputRef.current?.click();

  const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setError(null);
    setSuccess(null);
    setAvatarUploading(true);
    let step = "Checking file type and size";
    setAvatarStep(step);
    try {
      const validationError = getProfileImageValidationError(file);
      if (validationError) {
        throw new Error(validationError);
      }

      step = "Uploading to Firebase Storage";
      setAvatarStep(step);
      const url = await uploadUserProfilePhoto(user.uid, file);

      step = "Saving photo URL to Firestore";
      setAvatarStep(step);
      await saveUserProfileDocument(user.uid, { photoURL: url });

      step = "Updating Firebase Auth profile";
      setAvatarStep(step);
      await updateProfile(user, { photoURL: url });

      step = "Refreshing your session";
      setAvatarStep(step);
      await refreshUser();

      showMessage("Profile photo updated.");
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Publish Desk avatar upload]", { step, file: file.name, size: file.size, err });
      }
      setSuccess(null);
      setError(formatAvatarUploadFailure(step, err));
    } finally {
      setAvatarStep(null);
      setAvatarUploading(false);
    }
  };

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    const u = sanitizeSingleLine(username);
    if (u && !USERNAME_RE.test(u)) {
      setError("Username: use 1–40 letters, numbers, underscores, or hyphens only.");
      return;
    }
    const name = sanitizeSingleLine(fullName);
    const rec = sanitizeSingleLine(recoveryEmail);
    if (rec && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rec)) {
      setError("Please enter a valid recovery email or leave it blank.");
      return;
    }
    setSaving(true);
    try {
      await saveUserProfileDocument(user.uid, {
        username: u || null,
        fullName: name || null,
        recoveryEmail: rec || null,
        headline: sanitizeSingleLine(headline) || null,
        country: country || null,
        photoURL: user.photoURL ?? null,
      });
      await updateProfile(user, {
        displayName: name || null,
      });
      await refreshUser();
      showMessage("Profile saved.");
    } catch (err) {
      setSuccess(null);
      setError(formatUserFacingFirebaseError(err, "Could not save profile."));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="border-b border-[#E2E8F0] px-6 py-5 sm:px-8">
        <h1 className="font-sans text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">
          Profile details
        </h1>
        <p className="mt-1.5 font-sans text-sm text-[#64748B]">
          You have full control to manage your own account setting.
        </p>
      </div>

      <form className="px-6 py-6 sm:px-8" onSubmit={onSaveProfile}>
        {error ? (
          <div
            className="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 font-sans text-sm text-red-900 shadow-sm"
            role="alert"
          >
            <p className="font-semibold text-red-950">Something went wrong</p>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-red-800">{error}</p>
          </div>
        ) : success ? (
          <div
            className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 font-sans text-sm text-emerald-900"
            role="status"
          >
            {success}
          </div>
        ) : null}

        {/* Avatar — one row: circle | label + hint | Update (matches reference layout) */}
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
            <div className="size-20 shrink-0 overflow-hidden rounded-full bg-[#E5E7EB] ring-1 ring-[#E2E8F0]">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  width={80}
                  height={80}
                  className="block h-20 w-20 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center bg-[#F1F5F9]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/private/user-icon.png"
                    alt=""
                    className="max-h-12 max-w-12 object-contain opacity-90"
                    width={48}
                    height={48}
                    decoding="async"
                  />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-semibold text-[#0F172A]">Your avatar</p>
              <p className="mt-1 max-w-xl font-sans text-xs leading-relaxed text-[#64748B]">
                PNG or JPG/JPEG — at least 200×200px, max {formatFileSizeForDisplay(PROFILE_AVATAR_MAX_BYTES)}
                . WebP and HEIC are also supported.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif"
              className="sr-only"
              aria-label="Choose profile photo"
              onChange={onAvatarFileChange}
            />
            <button
              type="button"
              onClick={onPickAvatar}
              disabled={avatarUploading}
              className="w-full rounded-lg border border-[#D1D5DB] bg-white px-5 py-2.5 font-sans text-sm font-medium text-[#374151] shadow-sm transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {avatarUploading ? "Working…" : "Update"}
            </button>
            {avatarStep ? (
              <p className="text-center font-sans text-xs text-[#6366F1] sm:text-right" aria-live="polite">
                {avatarStep}…
              </p>
            ) : null}
          </div>
        </div>

        {/* Personal details */}
        <div className="pt-8">
          <h2 className="font-sans text-base font-bold text-[#0F172A]">Personal details</h2>
          <p className="mt-1 font-sans text-sm text-[#64748B]">
            Update your personal details and email address. Some fields are managed by your sign-in
            provider.
          </p>

          {profileLoading ? (
            <p className="mt-6 font-sans text-sm text-[#64748B]">Loading profile…</p>
          ) : (
            <>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <FieldLabel htmlFor="acct-username">Username</FieldLabel>
                  <input
                    id="acct-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(ev) => setUsername(ev.target.value)}
                    className={inputClass}
                    placeholder="username"
                  />
                  <Helper>Choose how your public profile link will look like.</Helper>
                </div>
                <div className="sm:col-span-1">
                  <FieldLabel htmlFor="acct-fullname">Name</FieldLabel>
                  <input
                    id="acct-fullname"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(ev) => setFullName(ev.target.value)}
                    className={inputClass}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="sm:col-span-1">
                  <FieldLabel htmlFor="acct-email">Email</FieldLabel>
                  <input
                    id="acct-email"
                    type="email"
                    readOnly
                    value={email}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                  <Helper>Primary email used for account login and communications.</Helper>
                </div>
                <div className="sm:col-span-1">
                  <FieldLabel htmlFor="acct-recovery">Recovery email</FieldLabel>
                  <input
                    id="acct-recovery"
                    type="email"
                    autoComplete="email"
                    value={recoveryEmail}
                    onChange={(ev) => setRecoveryEmail(ev.target.value)}
                    className={inputClass}
                    placeholder="Enter your recovery email"
                  />
                  <Helper>Used only for account recovery notifications.</Helper>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel htmlFor="acct-headline">Headline</FieldLabel>
                  <input
                    id="acct-headline"
                    type="text"
                    value={headline}
                    onChange={(ev) => setHeadline(ev.target.value)}
                    className={inputClass}
                    placeholder="Enter a headline"
                  />
                </div>
                <div className="sm:col-span-1">
                  <FieldLabel htmlFor="acct-country">Country</FieldLabel>
                  <select
                    id="acct-country"
                    value={country}
                    onChange={(ev) => setCountry(ev.target.value)}
                    className={inputClass}
                  >
                    <option value="us">United States</option>
                    <option value="gb">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="in">India</option>
                    <option value="au">Australia</option>
                    <option value="de">Germany</option>
                    <option value="fr">France</option>
                    <option value="other">Other</option>
                  </select>
                  <Helper>Shown on your public profile where applicable.</Helper>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={saving || profileLoading}
                  className="inline-flex min-h-[44px] min-w-[140px] items-center justify-center rounded-lg bg-[#4F46E5] px-6 py-2.5 font-sans text-sm font-semibold !text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Update profile"}
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
