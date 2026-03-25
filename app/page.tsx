"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAllMagazines } from "@/lib/firestore/collections";
import { MagazineHubView2 } from "@/components/magazine-view-2/MagazineHubView2";
import { MagazineViewToggle } from "@/components/magazine-view-2/MagazineViewToggle";
import type { Magazine } from "@/components/magazine-view-2/types";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { SitePageGutter } from "@/components/site-page-gutter";

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  /** Magazine View 2 is default; `?view=list` selects the classic list. */
  const view = searchParams.get("view") === "list" ? "list" : "magazine2";
  const { user, loading: authLoading, signOut } = useAuth();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");

  const openIssueQuery = "";

  function setViewMode(next: "list" | "magazine2") {
    const p = new URLSearchParams(searchParams.toString());
    if (next === "list") p.set("view", "list");
    else p.delete("view");
    const q = p.toString();
    router.push(q ? `/?${q}` : "/");
  }

  useEffect(() => {
    setLoading(true);
    getAllMagazines(category || undefined, tag || undefined).then((list) => {
      setMagazines(list as Magazine[]);
      setLoading(false);
    });
  }, [category, tag]);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <header className="sticky top-0 z-50 h-[72px] w-full shrink-0 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-6">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
            <Link
              href="/"
              className="shrink-0 font-display text-xl font-semibold text-accent no-underline transition-opacity hover:opacity-90"
            >
              Publish Desk
            </Link>
            <MagazineViewToggle mode={view} onChange={setViewMode} />
          </div>
          <nav className="flex shrink-0 items-center gap-4 font-sans">
            {authLoading ? (
              <span className="text-sm text-[#6B7280]">Loading...</span>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-[15px] font-medium text-[#374151] no-underline transition-colors hover:text-[#111827]"
                >
                  Dashboard
                </Link>
                <ProfileDropdown user={user} onSignOut={signOut} triggerVariant="headerIcon" />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[15px] font-medium text-[#374151] no-underline transition-colors hover:text-[#111827]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {view === "magazine2" ? (
        <>
          <SitePageGutter className="flex flex-wrap gap-3 pt-8 pb-2">
            <input
              type="text"
              placeholder="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 min-w-[200px] flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-sans text-sm text-[#111827] shadow-sm placeholder:text-[#9CA3AF] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 sm:max-w-xs sm:flex-none"
            />
            <input
              type="text"
              placeholder="Filter by tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="h-10 min-w-[200px] flex-1 rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-sans text-sm text-[#111827] shadow-sm placeholder:text-[#9CA3AF] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 sm:max-w-xs sm:flex-none"
            />
          </SitePageGutter>
          {loading ? (
            <SitePageGutter>
              <p className="py-24 text-center font-sans text-sm text-[#6B7280]">Loading magazines…</p>
            </SitePageGutter>
          ) : magazines.length === 0 ? (
            <SitePageGutter>
              <div className="mx-auto max-w-lg py-20 text-center">
                <p className="mb-2 text-[#6B7280]">No magazines yet.</p>
                <p className="text-sm text-[#111827]">Sign up and create one from your dashboard.</p>
              </div>
            </SitePageGutter>
          ) : (
            <MagazineHubView2 magazines={magazines} openIssueQuery={openIssueQuery} />
          )}
        </>
      ) : (
        <SitePageGutter className="py-14">
          <main>
          <div className="mb-10">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#111827]">Magazines</h1>
            <p className="font-sans text-lg text-[#6B7280]">Browse magazines by category and tags.</p>
          </div>
          <div className="mb-10 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-52 rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-sans text-sm text-[#111827] shadow-sm placeholder:text-[#9CA3AF] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            />
            <input
              type="text"
              placeholder="Filter by tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="h-10 w-52 rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-sans text-sm text-[#111827] shadow-sm placeholder:text-[#9CA3AF] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            />
          </div>
          {loading ? (
            <div className="py-12 text-center font-sans text-sm text-[#6B7280]">Loading magazines…</div>
          ) : magazines.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center shadow-sm">
              <p className="mb-1 text-[#6B7280]">No magazines yet.</p>
              <p className="text-sm text-[#111827]">Sign up and create one from your dashboard.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {magazines.map((m) => (
                <li key={`${m.userId}-${m.slug}`}>
                  <Link
                    href={`/magazines/${m.userId}/${m.slug}?view=list`}
                    className="block rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all duration-200 no-underline hover:border-indigo-200 hover:shadow-md"
                  >
                    <h2 className="text-lg font-semibold text-[#111827]">{m.name}</h2>
                    {m.description && <p className="mt-1.5 font-sans text-sm text-[#6B7280]">{m.description}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          </main>
        </SitePageGutter>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>}>
      <HomePageInner />
    </Suspense>
  );
}
