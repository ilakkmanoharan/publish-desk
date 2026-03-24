"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { getMagazineByUserIdAndSlug, getPublicationByContentSlug } from "@/lib/firestore/collections";
import { slugToTitle } from "@/lib/format-title";
import { ArticleBody } from "./article-body";
import { ArticleBodyMagazine } from "./article-body-magazine";

function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (typeof (v as { toDate?: () => Date }).toDate === "function")
    return (v as { toDate: () => Date }).toDate();
  if (v instanceof Date) return v;
  return null;
}

function ArticlePageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const slug = params.slug as string;
  const contentSlug = params.contentSlug as string;
  const layoutMagazine = searchParams.get("layout") === "magazine";

  const [magazine, setMagazine] = useState<{ name: string } | null>(null);
  const [content, setContent] = useState<{ title: string; body: string; excerpt?: string } | null>(null);
  const [displayTitleOverride, setDisplayTitleOverride] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMagazineByUserIdAndSlug(userId, slug).then(async (m) => {
      if (!m) {
        setLoading(false);
        return;
      }
      setMagazine(m);
      const result = await getPublicationByContentSlug(userId, m.id, contentSlug);
      if (!result) {
        setContent(null);
        setDisplayTitleOverride(null);
        setLoading(false);
        return;
      }
      setContent(result.content);
      setDisplayTitleOverride(result.publication.displayTitle?.trim() || null);
      setPublishedAt(toDate(result.publication.publishedAt));
      setLoading(false);
    });
  }, [userId, slug, contentSlug]);

  if (loading) return <div className="min-h-screen bg-background p-8">Loading...</div>;
  if (!magazine || !content) return <div className="min-h-screen bg-background p-8">Article not found.</div>;

  const titleSource = displayTitleOverride || content.title;
  const displayTitle = slugToTitle(titleSource);
  const magazineBackHref = layoutMagazine
    ? `/magazines/${userId}/${slug}?view=magazine2`
    : `/magazines/${userId}/${slug}`;

  if (layoutMagazine) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto max-w-4xl flex justify-between items-center px-6 py-4">
            <Link href="/" className="text-xl font-semibold text-accent no-underline hover:opacity-90 transition-opacity font-display">
              Publish Desk
            </Link>
            <Link
              href={magazineBackHref}
              className="text-sm text-muted hover:text-foreground no-underline transition-colors"
            >
              ← {magazine.name}
            </Link>
          </div>
        </header>
        <article className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <header className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight mb-4">
              {displayTitle}
            </h1>
            {publishedAt && (
              <p className="text-muted text-sm font-sans">
                {publishedAt.toLocaleDateString()} · {magazine.name}
              </p>
            )}
          </header>
          {content.excerpt && (
            <p className="font-sans text-lg md:text-xl text-muted leading-relaxed max-w-3xl mx-auto mb-10 md:mb-12 text-center">
              {content.excerpt}
            </p>
          )}
          <ArticleBodyMagazine content={content.body} />
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl flex justify-between items-center px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-accent no-underline hover:opacity-90 transition-opacity">
            Publish Desk
          </Link>
          <Link
            href={magazineBackHref}
            className="text-sm text-muted hover:text-foreground no-underline transition-colors"
          >
            ← {magazine.name}
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">{displayTitle}</h1>
        {publishedAt && (
          <p className="text-muted text-sm mb-6">
            {publishedAt.toLocaleDateString()} · {magazine.name}
          </p>
        )}
        {content.excerpt && (
          <p className="text-lg text-muted mb-8">{content.excerpt}</p>
        )}
        <ArticleBody content={content.body} />
      </article>
    </div>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-muted">Loading...</div>}>
      <ArticlePageInner />
    </Suspense>
  );
}
