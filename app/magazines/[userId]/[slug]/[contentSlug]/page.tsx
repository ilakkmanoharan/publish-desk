"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getMagazineByUserIdAndSlug, getPublicationByContentSlug } from "@/lib/firestore/collections";
import { slugToTitle } from "@/lib/format-title";
import { buildMarkdownTeaser } from "@/lib/premium-teaser";
import { getAuthorDisplayName } from "@/lib/author-display";
import { ArticleBody } from "./article-body";
import { ArticleBodyComic } from "./article-body-comic";
import { ArticleBodyMagazine } from "./article-body-magazine";
import { ArticleShareMenu } from "@/components/article-share-menu";
import { PremiumArticleGate, PremiumBadge } from "./premium-article-gate";

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
  const [content, setContent] = useState<{
    title: string;
    body: string;
    excerpt?: string;
    author?: string;
    premiumOnly?: boolean;
    premiumPriceUsd?: number | null;
    readerLayout?: "magazine" | "comic";
    visibility?: "private_link";
  } | null>(null);
  const [displayTitleOverride, setDisplayTitleOverride] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  const paywalled = useMemo(() => {
    if (!content?.premiumOnly) return false;
    return user?.uid !== userId;
  }, [content, user?.uid, userId]);

  const bodyToRender = useMemo(() => {
    if (!content) return "";
    if (!content.premiumOnly || user?.uid === userId) return content.body;
    return buildMarkdownTeaser(content.body, 0.2);
  }, [content, user?.uid, userId]);

  const isComicLayout = content?.readerLayout === "comic";

  const ArticleBodyVariant = isComicLayout
    ? ArticleBodyComic
    : layoutMagazine
      ? ArticleBodyMagazine
      : ArticleBody;

  const articleGutterClass = isComicLayout
    ? "mx-auto w-full max-w-3xl px-6 sm:px-12 md:px-16 lg:px-24 py-12 md:py-16 overflow-x-hidden min-w-0"
    : layoutMagazine
      ? "mx-auto max-w-4xl px-6 py-12 md:py-16 overflow-x-hidden min-w-0"
      : "mx-auto max-w-2xl px-6 py-14";

  if (loading) return <div className="min-h-screen bg-background p-8">Loading...</div>;
  if (!magazine || !content) return <div className="min-h-screen bg-background p-8">Article not found.</div>;

  // Private-link-only: check access token
  if (content.visibility === "private_link") {
    const accessToken = searchParams.get("access");
    const isOwner = user?.uid === userId;
    if (!isOwner && !accessToken) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Private Article</h1>
          <p className="mt-3 max-w-md text-muted">
            This article is private. Please use the private access link provided by the author.
          </p>
        </div>
      );
    }
  }

  const titleSource = displayTitleOverride || content.title;
  const displayTitle = slugToTitle(titleSource);
  const authorName = getAuthorDisplayName(content.author);
  const listReturn = searchParams.get("view") === "list";
  const magazineBackHref = layoutMagazine
    ? `/magazines/${userId}/${slug}`
    : `/magazines/${userId}/${slug}${listReturn ? "?view=list" : ""}`;

  const authorLine = (
    <p className="mt-3 mb-2 font-sans text-[17px] leading-snug text-[#4b5563]">
      <span className="font-medium">Author:</span> {authorName}
    </p>
  );

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
        <article className={articleGutterClass}>
          <header className="relative mx-auto mb-10 max-w-4xl md:mb-14">
            <div className="mx-auto max-w-3xl text-center">
              {paywalled && (
                <div className="mb-4 flex justify-center">
                  <PremiumBadge />
                </div>
              )}
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl mb-1">
                {displayTitle}
              </h1>
              {authorLine}
              {publishedAt && (
                <p className="font-sans text-sm text-muted">
                  {publishedAt.toLocaleDateString()} · {magazine.name}
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-end px-1 sm:px-2 md:absolute md:right-0 md:top-1/2 md:z-20 md:mt-0 md:-translate-y-1/2 md:px-0">
              <ArticleShareMenu title={displayTitle} />
            </div>
          </header>
          {content.excerpt && (
            <p className="font-sans text-lg md:text-xl text-muted leading-relaxed max-w-3xl mx-auto mb-10 md:mb-12 text-center">
              {content.excerpt}
            </p>
          )}
          {paywalled ? (
            <PremiumArticleGate
              magazineName={magazine.name}
              premiumPriceUsd={content.premiumPriceUsd ?? null}
              isAuthenticatedReader={Boolean(user)}
            >
              <ArticleBodyVariant content={bodyToRender} />
            </PremiumArticleGate>
          ) : (
            <ArticleBodyVariant content={bodyToRender} />
          )}
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
      <article className={articleGutterClass}>
        {paywalled && (
          <div className="mb-3">
            <PremiumBadge />
          </div>
        )}
        <div className="relative mb-6 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">{displayTitle}</h1>
          {authorLine}
          {publishedAt ? (
            <p className="text-sm text-muted">{publishedAt.toLocaleDateString()} · {magazine.name}</p>
          ) : null}
          <div className="mt-3 flex justify-end md:absolute md:right-0 md:top-1/2 md:z-20 md:mt-0 md:-translate-y-1/2">
            <ArticleShareMenu title={displayTitle} />
          </div>
        </div>
        {content.excerpt && (
          <p className="text-lg text-muted mb-8">{content.excerpt}</p>
        )}
        {paywalled ? (
          <PremiumArticleGate
            magazineName={magazine.name}
            premiumPriceUsd={content.premiumPriceUsd ?? null}
            isAuthenticatedReader={Boolean(user)}
          >
            <ArticleBodyVariant content={bodyToRender} />
          </PremiumArticleGate>
        ) : (
          <ArticleBodyVariant content={bodyToRender} />
        )}
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
