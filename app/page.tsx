"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getAllMagazines } from "@/lib/firestore/collections";
import { MagazineHubHeroFilters } from "@/components/magazine-view-2/MagazineHubHeroFilters";
import { MagazineHubView2 } from "@/components/magazine-view-2/MagazineHubView2";
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
  const [search, setSearch] = useState("");

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

  const filteredMagazines = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return magazines;
    return magazines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q)
    );
  }, [magazines, search]);

  const hubDescriptionMagazine2 =
    "Browse editorial collections—story-driven reading, not just a feed.";
  const hubDescriptionList = "Browse magazines by category and tags.";

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <header className="site-header sticky top-0 z-50 h-[72px] w-full shrink-0 border-b border-[#E5E7EB] bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between gap-6 px-8 lg:px-12">
          <Link
            href="/"
            className="shrink-0 font-display text-xl font-semibold tracking-tight text-accent no-underline transition-opacity hover:opacity-90 sm:text-[1.35rem]"
          >
            Publish Desk
          </Link>
          <nav className="flex min-w-0 shrink-0 items-center font-sans">
            {authLoading ? (
              <span className="text-sm text-[#6B7280]">Loading...</span>
            ) : user ? (
              <div className="right-section flex min-w-max shrink-0 items-center gap-4">
                <Link
                  href="/dashboard"
                  className="shrink-0 text-[15px] font-medium tracking-[0.3px] text-[#374151] no-underline transition-colors hover:text-[#111827]"
                >
                  Dashboard
                </Link>
                <ProfileDropdown user={user} onSignOut={signOut} triggerVariant="headerIcon" />
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Link
                  href="/login"
                  className="shrink-0 text-[15px] font-medium tracking-[0.3px] text-[#374151] no-underline transition-colors hover:text-[#111827]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="shrink-0 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium tracking-[0.3px] text-white no-underline transition-opacity hover:opacity-90"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {view === "magazine2" ? (
        <SitePageGutter className="pb-16 pt-8">
          <MagazineHubHeroFilters
            view={view}
            onViewChange={setViewMode}
            description={hubDescriptionMagazine2}
            category={category}
            tag={tag}
            search={search}
            onCategoryChange={setCategory}
            onTagChange={setTag}
            onSearchChange={setSearch}
          />
          {loading ? (
            <p className="py-24 text-center font-sans text-sm text-[#6B7280]">Loading magazines…</p>
          ) : magazines.length === 0 ? (
            <div className="mx-auto max-w-lg py-20 text-center">
              <p className="mb-2 text-[#6B7280]">No magazines yet.</p>
              <p className="text-sm text-[#111827]">Sign up and create one from your dashboard.</p>
            </div>
          ) : filteredMagazines.length === 0 ? (
            <p className="py-16 text-center font-sans text-sm text-[#6B7280]">
              No magazines match your filters. Try another category, tag, or search.
            </p>
          ) : (
            <MagazineHubView2 magazines={filteredMagazines} openIssueQuery={openIssueQuery} contentOnly />
          )}
        </SitePageGutter>
      ) : (
        <SitePageGutter className="pb-16 pt-8">
          <MagazineHubHeroFilters
            view={view}
            onViewChange={setViewMode}
            description={hubDescriptionList}
            category={category}
            tag={tag}
            search={search}
            onCategoryChange={setCategory}
            onTagChange={setTag}
            onSearchChange={setSearch}
          />
          {loading ? (
            <p className="py-24 text-center font-sans text-sm text-[#6B7280]">Loading magazines…</p>
          ) : magazines.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center shadow-sm">
              <p className="mb-1 text-[#6B7280]">No magazines yet.</p>
              <p className="text-sm text-[#111827]">Sign up and create one from your dashboard.</p>
            </div>
          ) : filteredMagazines.length === 0 ? (
            <p className="py-16 text-center font-sans text-sm text-[#6B7280]">
              No magazines match your filters. Try another category, tag, or search.
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredMagazines.map((m) => (
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
