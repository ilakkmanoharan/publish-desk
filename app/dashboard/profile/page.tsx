"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  getUserContent,
  getUserMagazines,
  getUserPublications,
} from "@/lib/firestore/collections";
import { ProfileScheduleTab } from "./profile-schedule-tab";
import { ProfileSourceTab } from "./profile-source-tab";

type TabId = "overview" | "magazines" | "content" | "schedule" | "source";

function sanitizeSingleLine(s: string): string {
  return s
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatMemberSince(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-sans text-sm font-medium transition-colors ${
        active
          ? "bg-white text-[#111827] shadow-sm ring-1 ring-[#E5E7EB]"
          : "text-[#6B7280] hover:bg-white/60 hover:text-[#111827]"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: string | number;
  accentClass: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] p-5 ring-1 ring-black/[0.02]">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight text-[#111827]">{value}</p>
      <div className={`absolute bottom-0 left-5 right-5 h-0.5 rounded-full ${accentClass}`} aria-hidden />
    </div>
  );
}

/** White panel on gray dashboard canvas (CyberDefenders-style boxed sections). */
function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-8 ${className}`.trim()}
    >
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabId>("overview");
  const [magCount, setMagCount] = useState<number | null>(null);
  const [contentCount, setContentCount] = useState<number | null>(null);
  const [publishedCount, setPublishedCount] = useState<number | null>(null);
  const [scheduledCount, setScheduledCount] = useState<number | null>(null);
  const [magazines, setMagazines] = useState<{ id: string; name: string; slug: string; description?: string }[]>(
    []
  );
  const [copyLabel, setCopyLabel] = useState<string | null>(null);

  const displayName = useMemo(() => {
    if (!user) return "";
    const raw = user.displayName?.trim() || user.email?.split("@")[0] || "Reader";
    return sanitizeSingleLine(raw);
  }, [user]);

  const email = user?.email ? sanitizeSingleLine(user.email) : "";

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      const [mags, content, published, scheduled] = await Promise.all([
        getUserMagazines(user.uid),
        getUserContent(user.uid),
        getUserPublications(user.uid, "Published"),
        getUserPublications(user.uid, "Scheduled"),
      ]);
      if (cancelled) return;
      setMagazines(mags);
      setMagCount(mags.length);
      setContentCount(content.length);
      setPublishedCount(published.length);
      setScheduledCount(scheduled.length);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const publicBase = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const copyUrl = useCallback(
    async (url: string, message: string) => {
      try {
        await navigator.clipboard.writeText(url);
        setCopyLabel(message);
        setTimeout(() => setCopyLabel(null), 2000);
      } catch {
        setCopyLabel("Could not copy");
        setTimeout(() => setCopyLabel(null), 2000);
      }
    },
    []
  );

  if (authLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 font-sans text-sm text-[#6B7280] sm:px-6">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const profileUrl = publicBase ? `${publicBase}/` : "";

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827] md:text-3xl">Profile</h1>
        <p className="mt-1 font-sans text-sm text-[#6B7280]">Editorial dashboard — boxed layout, centered column.</p>
      </div>

      <div className="flex flex-col gap-6">
      {/* Hero — editorial masthead */}
      <section className="profile-page-hero relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F3F4F6] ring-2 ring-[#E5E7EB] md:h-32 md:w-32">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-full min-h-0 w-full min-w-0 object-cover"
                  width={128}
                  height={128}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/private/user-icon.png"
                  alt=""
                  className="max-h-20 max-w-20 object-contain md:max-h-24 md:max-w-24"
                  width={96}
                  height={96}
                  decoding="async"
                />
              )}
              <span
                className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">Contributor</p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#111827] md:text-4xl">
                {displayName}
              </h1>
              {email ? (
                <p className="mt-2 font-sans text-sm text-[#6B7280]">{email}</p>
              ) : null}
              <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-[#6B7280]">
                Your editorial dashboard: identity, magazines, content, schedule, and GitHub source — in one place.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
            <button
              type="button"
              onClick={() => profileUrl && void copyUrl(profileUrl, "Link copied")}
              disabled={!profileUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] px-4 py-2.5 font-sans text-sm font-medium text-[#374151] transition-colors hover:border-[#D1D5DB] hover:bg-white disabled:opacity-50"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Copy site link
            </button>
            <Link
              href="/dashboard/magazines"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 font-sans text-sm font-medium text-[#374151] no-underline transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 19.5A2.5 2.5 0 016.5 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Manage magazines
            </Link>
          </div>
        </div>
        {copyLabel ? (
          <p className="mt-4 font-sans text-xs text-indigo-600" role="status">
            {copyLabel}
          </p>
        ) : null}
      </section>

      {/* Tabs — outer box, inner rail */}
      <Panel className="!p-3 md:!p-4">
        <div className="flex flex-wrap gap-2 rounded-xl bg-[#F3F4F6] p-1.5">
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" />
            <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" />
          </svg>
          Overview
        </TabButton>
        <TabButton active={tab === "magazines"} onClick={() => setTab("magazines")}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 19.5A2.5 2.5 0 016.5 17H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          Magazines
        </TabButton>
        <TabButton active={tab === "content"} onClick={() => setTab("content")}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" />
          </svg>
          Content
        </TabButton>
        <TabButton active={tab === "schedule"} onClick={() => setTab("schedule")}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" />
          </svg>
          Schedule
        </TabButton>
        <TabButton active={tab === "source"} onClick={() => setTab("source")}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 009.91 3S8.91 4.18 8.91 5.5 7.5 7.5 7.5 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Source
        </TabButton>
        </div>
      </Panel>

      {tab === "overview" && (
        <Panel>
          <h2 className="font-display text-xl font-semibold text-[#111827] md:text-2xl">Overview</h2>
          <p className="mt-1 font-sans text-sm text-[#6B7280]">At a glance — counts and editorial focus.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Magazines"
              value={magCount ?? "—"}
              accentClass="bg-gradient-to-r from-amber-600 to-amber-500"
            />
            <StatCard
              label="Drafts & pieces"
              value={contentCount ?? "—"}
              accentClass="bg-gradient-to-r from-stone-600 to-stone-500"
            />
            <StatCard
              label="Scheduled"
              value={scheduledCount ?? "—"}
              accentClass="bg-gradient-to-r from-violet-600 to-violet-500"
            />
            <StatCard
              label="Published"
              value={publishedCount ?? "—"}
              accentClass="bg-gradient-to-r from-emerald-600 to-emerald-500"
            />
            <StatCard
              label="Member since"
              value={formatMemberSince(user.metadata?.creationTime)}
              accentClass="bg-gradient-to-r from-indigo-600 to-indigo-500"
            />
          </div>

          <div className="mt-10 border-t border-[#E5E7EB] pt-10">
            <h3 className="font-display text-lg font-semibold text-[#111827]">Desk</h3>
            <p className="mt-1 font-sans text-sm text-[#6B7280]">Rhythm, reader preview, and shortcuts.</p>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] p-6 ring-1 ring-black/[0.02]">
              <h2 className="font-display text-lg font-semibold text-[#111827]">Editorial rhythm</h2>
              <p className="mt-2 font-sans text-sm text-[#6B7280]">
                Build issues on a steady cadence. Readers notice calm, predictable publishing.
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 font-sans text-sm font-medium text-[#111827]">
                    <span className="text-lg" aria-hidden>
                      ✦
                    </span>
                    Current focus
                  </div>
                  <p className="mt-1 font-sans text-xs text-[#6B7280]">Ship your next magazine issue.</p>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 font-sans text-sm font-medium text-[#111827]">
                    <span className="text-lg" aria-hidden>
                      ★
                    </span>
                    Long-term
                  </div>
                  <p className="mt-1 font-sans text-xs text-[#6B7280]">Grow a recognizable collection readers return to.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] p-6 ring-1 ring-black/[0.02] lg:col-span-1">
              <h2 className="font-display text-lg font-semibold text-[#111827]">Reading desk</h2>
              <p className="mt-2 font-sans text-sm text-[#6B7280]">
                Preview how your work appears on the public magazines hub.
              </p>
              <div className="mt-6 flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-white px-4">
                <p className="text-center font-sans text-sm text-[#9CA3AF]">Your public hub updates as you publish.</p>
              </div>
              <Link
                href="/"
                className="mt-4 inline-flex font-sans text-sm font-medium text-accent no-underline hover:underline"
              >
                Open magazines →
              </Link>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] p-6 ring-1 ring-black/[0.02]">
              <h2 className="font-display text-lg font-semibold text-[#111827]">Recent magazines</h2>
              <p className="mt-2 font-sans text-sm text-[#6B7280]">Quick access to titles you curate.</p>
              <ul className="mt-4 space-y-2">
                {magazines.length === 0 ? (
                  <li className="font-sans text-sm text-[#9CA3AF]">No magazines yet.</li>
                ) : (
                  magazines.slice(0, 5).map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/dashboard/magazines/${m.id}`}
                        className="block rounded-lg px-2 py-2 font-sans text-sm text-[#374151] no-underline transition-colors hover:bg-white hover:text-[#111827]"
                      >
                        {m.name}
                        <span className="ml-2 text-[#9CA3AF]">/{m.slug}</span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
          </div>
        </Panel>
      )}

      {tab === "magazines" && (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-[#111827]">Your magazines</h2>
            <Link
              href="/dashboard/magazines"
              className="rounded-xl bg-[#111827] px-4 py-2 font-sans text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
            >
              Add or edit
            </Link>
          </div>
          <ul className="mt-6 divide-y divide-[#E5E7EB]">
            {magazines.length === 0 ? (
              <li className="py-8 text-center font-sans text-sm text-[#6B7280]">No magazines yet.</li>
            ) : (
              magazines.map((m) => (
                <li key={m.id} className="py-4">
                  <Link
                    href={`/dashboard/magazines/${m.id}`}
                    className="group block no-underline"
                  >
                    <span className="font-display text-lg font-semibold text-[#111827] group-hover:text-accent">
                      {m.name}
                    </span>
                    <span className="ml-2 font-sans text-sm text-[#9CA3AF]">/{m.slug}</span>
                    {m.description ? (
                      <p className="mt-1 font-sans text-sm text-[#6B7280]">{m.description}</p>
                    ) : null}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Panel>
      )}

      {tab === "content" && (
        <Panel className="text-center">
          <h2 className="font-display text-xl font-semibold text-[#111827]">Content library</h2>
          <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-[#6B7280]">
            Drafts, edits, and assignments live in your main content workspace. Open it to continue writing and assign
            pieces to magazines.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-[#111827] px-5 py-2.5 font-sans text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            Go to content
          </Link>
        </Panel>
      )}

      {tab === "schedule" && (
        <Panel>
          <h2 className="font-display text-xl font-semibold text-[#111827] md:text-2xl">Schedule</h2>
          <p className="mt-1 font-sans text-sm text-[#6B7280]">
            What is queued to publish and what is already live.
          </p>
          <div className="mt-6">
            <ProfileScheduleTab userId={user.uid} />
          </div>
        </Panel>
      )}

      {tab === "source" && (
        <Panel>
          <ProfileSourceTab userId={user.uid} />
        </Panel>
      )}
      </div>
    </div>
  );
}
