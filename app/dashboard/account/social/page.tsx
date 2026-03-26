"use client";

import type { ComponentProps, ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/auth-context";
import { formatUserFacingFirebaseError } from "@/lib/firebase/user-facing-error";
import {
  getUserProfileDocument,
  normalizeOptionalHttpUrl,
  saveUserProfileDocument,
} from "@/lib/user-profile";

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
  "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 pl-10 font-sans text-sm text-[#0F172A] shadow-sm transition-colors placeholder:text-[#94A3B8] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20";

function InputWithIcon({
  icon,
  className,
  ...inputProps
}: ComponentProps<"input"> & { icon: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">{icon}</span>
      <input {...inputProps} className={[inputClass, className].filter(Boolean).join(" ")} />
    </div>
  );
}

function IconLinkedIn() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconToastCheck() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AccountSocialPage() {
  const { user } = useAuth();
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveToastOpen, setSaveToastOpen] = useState(false);
  const [saveToastSeq, setSaveToastSeq] = useState(0);
  const [toastPortalReady, setToastPortalReady] = useState(false);

  useEffect(() => {
    setToastPortalReady(true);
  }, []);

  useEffect(() => {
    if (!saveToastOpen) return;
    const id = window.setTimeout(() => setSaveToastOpen(false), 5000);
    return () => window.clearTimeout(id);
  }, [saveToastOpen, saveToastSeq]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const doc = await getUserProfileDocument(user.uid);
      setLinkedin(doc?.linkedinUrl ?? "");
      setGithub(doc?.githubProfileUrl ?? "");
      setTwitter(doc?.twitterUrl ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load social profiles.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      const linkedinUrl = normalizeOptionalHttpUrl(linkedin);
      const githubProfileUrl = normalizeOptionalHttpUrl(github);
      const twitterUrl = normalizeOptionalHttpUrl(twitter);
      await saveUserProfileDocument(user.uid, {
        linkedinUrl,
        githubProfileUrl,
        twitterUrl,
      });
      setLinkedin(linkedinUrl ?? "");
      setGithub(githubProfileUrl ?? "");
      setTwitter(twitterUrl ?? "");
      setSaveToastSeq((n) => n + 1);
      setSaveToastOpen(true);
    } catch (err) {
      setError(formatUserFacingFirebaseError(err, "Could not save."));
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const saveToast =
    toastPortalReady && saveToastOpen
      ? createPortal(
          <div
            className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-[200] flex w-[min(100vw-2rem,22rem)] items-stretch overflow-hidden rounded-xl border border-[#0F172A] bg-white font-sans shadow-[0_10px_40px_-10px_rgba(15,23,42,0.25)] sm:bottom-6 sm:right-6"
            role="status"
            aria-live="polite"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 pr-2">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white"
                aria-hidden
              >
                <IconToastCheck />
              </div>
              <p className="text-sm font-medium leading-snug text-[#0F172A]">Social profile updated successfully.</p>
            </div>
            <div className="my-2 w-px shrink-0 self-stretch bg-[#0F172A]" aria-hidden />
            <button
              type="button"
              onClick={() => setSaveToastOpen(false)}
              className="flex w-11 shrink-0 items-center justify-center text-[#0F172A] transition-colors hover:bg-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6366F1]"
              aria-label="Dismiss notification"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {saveToast}
      <div className="space-y-8">
        <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] px-6 py-5 sm:px-8">
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">Social profiles</h1>
          <p className="mt-1.5 font-sans text-sm text-[#64748B]">
            Links are stored on your user document in Firestore (fields:{" "}
            <span className="font-mono text-[11px]">linkedinUrl</span>,{" "}
            <span className="font-mono text-[11px]">githubProfileUrl</span>,{" "}
            <span className="font-mono text-[11px]">twitterUrl</span>). Leave a field blank to clear it.
          </p>
        </div>

        <form className="space-y-6 px-6 py-6 sm:px-8" onSubmit={onSubmit}>
          {error ? (
            <div className="rounded-lg bg-red-50 px-4 py-3 font-sans text-sm text-red-800" role="alert">
              {error}
            </div>
          ) : null}
          {loading ? (
            <p className="font-sans text-sm text-[#64748B]">Loading…</p>
          ) : (
            <>
              <div>
                <FieldLabel htmlFor="social-linkedin">LinkedIn</FieldLabel>
                <InputWithIcon
                  id="social-linkedin"
                  type="url"
                  value={linkedin}
                  onChange={(ev) => setLinkedin(ev.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  autoComplete="url"
                  icon={<IconLinkedIn />}
                />
                <Helper>Example: https://www.linkedin.com/in/your-handle</Helper>
              </div>
              <div>
                <FieldLabel htmlFor="social-github">GitHub</FieldLabel>
                <InputWithIcon
                  id="social-github"
                  type="url"
                  value={github}
                  onChange={(ev) => setGithub(ev.target.value)}
                  placeholder="https://github.com/username"
                  autoComplete="url"
                  icon={<IconGitHub />}
                />
                <Helper>Example: https://github.com/your-handle</Helper>
              </div>
              <div>
                <FieldLabel htmlFor="social-twitter">Twitter (X)</FieldLabel>
                <InputWithIcon
                  id="social-twitter"
                  type="url"
                  value={twitter}
                  onChange={(ev) => setTwitter(ev.target.value)}
                  placeholder="https://x.com/username"
                  autoComplete="url"
                  icon={<IconX />}
                />
                <Helper>Example: https://x.com/your-handle</Helper>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#4F46E5] px-5 py-2.5 font-sans text-sm font-semibold !text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Update Social Profile"}
              </button>
            </>
          )}
        </form>
        </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] px-6 py-5 sm:px-8">
          <h2 className="font-sans text-lg font-bold text-[#0F172A]">Discord</h2>
          <p className="mt-1.5 font-sans text-sm text-[#64748B]">Connect your Discord account here.</p>
        </div>
        <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#5865F2] text-white">
            <svg width={28} height={28} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-sm font-semibold text-[#0F172A]">Discord</p>
            <p className="mt-1 font-sans text-sm leading-relaxed text-[#64748B]">
              One-click access and role sync are not wired up yet — this is a preview of the layout.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="shrink-0 rounded-lg border border-[#CBD5E1] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#0F172A] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Connect Discord
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
