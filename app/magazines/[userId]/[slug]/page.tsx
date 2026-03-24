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

  if (loading) return <div className="min-h-screen bg-background p-8">Loading...</div>;
  if (!magazine) return <div className="min-h-screen bg-background p-8">Magazine not found.</div>;

  const homeHref = view === "list" ? "/?view=list" : "/";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl flex flex-wrap justify-between items-center gap-3 px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-accent no-underline hover:opacity-90 transition-opacity font-display">
            Publish Desk
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <MagazineViewToggle mode={view} onChange={setViewMode} />
            <Link
              href={homeHref}
              className="text-sm text-muted hover:text-foreground no-underline transition-colors"
            >
              ← All magazines
            </Link>
          </div>
        </div>
      </header>

      {view === "magazine2" ? (
        <MagazineIssueView2
          userId={userId}
          magazineSlug={slug}
          magazineName={magazine.name}
          magazineDescription={magazine.description}
          categorySlugs={magazine.categorySlugs}
          publications={publications}
        />
      ) : (
        <main className="mx-auto max-w-4xl px-6 py-14">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">{magazine.name}</h1>
          {magazine.description && (
            <p className="text-muted text-lg mb-8">{magazine.description}</p>
          )}
          <h2 className="text-lg font-semibold text-foreground mb-4">Articles</h2>
          {publications.length === 0 ? (
            <p className="text-muted">No published articles yet.</p>
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
