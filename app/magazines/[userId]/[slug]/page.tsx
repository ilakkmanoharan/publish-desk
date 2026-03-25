"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getMagazineByUserIdAndSlug,
  getPublishedPublicationsForMagazine,
  getContentById,
} from "@/lib/firestore/collections";
import { sortPublicationsByMagazineOrder } from "@/lib/publication-order";
import { slugToTitle } from "@/lib/format-title";
import { ArticleRow } from "./article-row";
import { MagazineIssueView2 } from "@/components/magazine-view-2/MagazineIssueView2";
import { MagazineViewToggle } from "@/components/magazine-view-2/MagazineViewToggle";
import type { PublicationCard } from "@/lib/magazine-view-2-sections";
import { useAuth } from "@/contexts/auth-context";
import { SiteAppHeader } from "@/components/site-app-header";
import { SitePageGutter } from "@/components/site-page-gutter";

function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (typeof (v as { toDate?: () => Date }).toDate === "function")
    return (v as { toDate: () => Date }).toDate();
  if (v instanceof Date) return v;
  return null;
}

function MagazinePageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const slug = params.slug as string;
  const view = searchParams.get("view") === "list" ? "list" : "magazine2";

  const [magazine, setMagazine] = useState<{
    id: string;
    name: string;
    description?: string;
    categorySlugs?: string[];
  } | null>(null);
  const [publications, setPublications] = useState<PublicationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut, loading: authLoading } = useAuth();

  function setViewMode(next: "list" | "magazine2") {
    const p = new URLSearchParams(searchParams.toString());
    if (next === "list") p.set("view", "list");
    else p.delete("view");
    const q = p.toString();
    router.push(q ? `/magazines/${userId}/${slug}?${q}` : `/magazines/${userId}/${slug}`);
  }

  useEffect(() => {
    let cancelled = false;
    getMagazineByUserIdAndSlug(userId, slug).then(async (m) => {
      if (!m || cancelled) {
        setMagazine(null);
        setLoading(false);
        return;
      }
      setMagazine({
        id: m.id,
        name: m.name,
        description: m.description,
        categorySlugs: m.categorySlugs,
      });
      const pubs = await getPublishedPublicationsForMagazine(m.id, userId);
      const withContent = await Promise.all(
        (pubs as {
          id: string;
          contentId: string;
          displayTitle?: string | null;
          sortOrder?: number;
          publishedAt?: unknown;
        }[]).map(async (p) => {
          const content = await getContentById(p.contentId);
          const c =
            content ??
            ({
              id: "",
              title: "",
              slug: "",
              excerpt: undefined,
              categorySlug: undefined,
            } as const);
          const so = p.sortOrder;
          return {
            id: p.id,
            contentId: p.contentId,
            displayTitle: p.displayTitle?.trim() || null,
            sortOrder: typeof so === "number" && !Number.isNaN(so) ? so : undefined,
            publishedAt: p.publishedAt,
            content: {
              title: c.title,
              slug: c.slug,
              excerpt: c.excerpt,
              categorySlug: c.categorySlug,
            },
          } satisfies PublicationCard;
        })
      );
      if (!cancelled) {
        setPublications(
          sortPublicationsByMagazineOrder(
            withContent,
            (p) => toDate(p.publishedAt),
            (p) => slugToTitle(p.displayTitle ?? p.content.title)
          )
        );
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, slug]);

  const homeHref = view === "list" ? "/?view=list" : "/";

  const issueHeader = (
    <SiteAppHeader
      user={user}
      authLoading={authLoading}
      signOut={signOut}
      leftSlot={
        <MagazineViewToggle
          mode={view}
          onChange={setViewMode}
          variant="saas"
          magazine2Label="Magazine"
        />
      }
      rightSlot={
        <Link
          href={homeHref}
          className="shrink-0 whitespace-nowrap font-sans text-sm font-medium text-[#374151] no-underline transition-colors hover:text-[#111827]"
        >
          ← All magazines
        </Link>
      }
    />
  );

  if (loading) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] flex-col bg-[#F3F4F6]">
        {issueHeader}
        <div className="p-8 font-sans text-sm text-[#6B7280]">Loading...</div>
      </div>
    );
  }
  if (!magazine) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] flex-col bg-[#F3F4F6]">
        {issueHeader}
        <div className="p-8">Magazine not found.</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-[#F3F4F6]">
      {issueHeader}

      {view === "magazine2" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <MagazineIssueView2
            userId={userId}
            magazineSlug={slug}
            magazineName={magazine.name}
            magazineDescription={magazine.description}
            categorySlugs={magazine.categorySlugs}
            publications={publications}
          />
        </div>
      ) : (
        <main>
          <SitePageGutter className="py-14">
            <div className="mx-auto max-w-4xl rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm md:p-10">
              <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-[#111827]">{magazine.name}</h1>
              {magazine.description && (
                <p className="mb-8 font-sans text-lg text-[#6B7280]">{magazine.description}</p>
              )}
              <h2 className="mb-4 font-sans text-lg font-semibold text-[#111827]">Articles</h2>
              {publications.length === 0 ? (
                <p className="font-sans text-sm text-[#6B7280]">No published articles yet.</p>
              ) : (
                <ul className="space-y-3">
                  {publications.map((pub) => (
                    <ArticleRow
                      key={pub.id}
                      userId={userId}
                      magazineSlug={slug}
                      contentSlug={pub.content.slug}
                      title={pub.displayTitle ?? pub.content.title}
                      publishedAt={toDate(pub.publishedAt)}
                      listViewContext={view === "list"}
                    />
                  ))}
                </ul>
              )}
            </div>
          </SitePageGutter>
        </main>
      )}
    </div>
  );
}

export default function MagazinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-muted">Loading...</div>}>
      <MagazinePageInner />
    </Suspense>
  );
}
