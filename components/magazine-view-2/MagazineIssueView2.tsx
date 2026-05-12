"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { slugToTitle } from "@/lib/format-title";
import {
  groupPublicationsByCategory,
  type PublicationCard,
} from "@/lib/magazine-view-2-sections";

type Props = {
  userId: string;
  magazineSlug: string;
  magazineName: string;
  magazineDescription?: string;
  categorySlugs?: string[];
  publications: PublicationCard[];
};

type Spread = {
  key: string;
  left: SpreadPage;
  right: SpreadPage;
};

type SpreadPage = {
  kind: "cover" | "article" | "quote" | "empty";
  section?: string;
  title: string;
  subtitle?: string | null;
  href?: string | null;
  author?: string;
  pageNum: number;
};

function buildSpreads(
  publications: PublicationCard[],
  categorySlugs: string[] | undefined,
  magazineName: string,
  magazineDescription: string | undefined,
  articleHref: (slug: string) => string
): Spread[] {
  const sections = groupPublicationsByCategory(publications.slice(1), categorySlugs);
  const featured = publications[0];

  const allPages: SpreadPage[] = [];
  let num = 1;

  allPages.push({
    kind: "cover",
    title: magazineName,
    subtitle: magazineDescription ?? null,
    pageNum: num++,
  });

  if (publications.length === 0) {
    allPages.push({
      kind: "empty",
      title: "No published articles yet",
      subtitle: "Sync content from your source or add pieces from the dashboard.",
      pageNum: num++,
    });
  } else {
    if (featured) {
      allPages.push({
        kind: "article",
        section: "Cover story",
        title: slugToTitle(featured.displayTitle ?? featured.content.title),
        subtitle: featured.content.excerpt ?? null,
        href: articleHref(featured.content.slug),
        pageNum: num++,
      });
    }

    allPages.push({
      kind: "quote",
      section: "From the editor",
      title: "Ideas worth a slower read",
      subtitle:
        "Section by section, like opening a print issue — calm typography that lets the writing lead.",
      pageNum: num++,
    });

    sections.forEach((section) => {
      section.items.forEach((pub) => {
        allPages.push({
          kind: "article",
          section: section.sectionLabel,
          title: slugToTitle(pub.displayTitle ?? pub.content.title),
          subtitle: pub.content.excerpt ?? null,
          href: articleHref(pub.content.slug),
          pageNum: num++,
        });
      });
    });
  }

  if (allPages.length % 2 !== 0) {
    allPages.push({
      kind: "empty",
      title: "",
      subtitle: null,
      pageNum: num++,
    });
  }

  const spreads: Spread[] = [];
  for (let i = 0; i < allPages.length; i += 2) {
    spreads.push({
      key: `spread-${i}`,
      left: allPages[i],
      right: allPages[i + 1],
    });
  }
  return spreads;
}

function PageContent({ page, totalPages }: { page: SpreadPage; totalPages: number }) {
  if (page.kind === "cover") {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8175]">
          Cover
        </p>
        <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-tight text-[#1a1612]">
          {page.title}
        </h2>
        {page.subtitle && (
          <p className="mt-4 max-w-[340px] font-sans text-[15px] leading-[1.65] text-[#5c5247]">
            {page.subtitle}
          </p>
        )}
        <p className="mt-8 font-sans text-xs tracking-[0.15em] text-[#a09585]">
          {totalPages} pages
        </p>
      </div>
    );
  }

  if (page.kind === "quote") {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 h-[2px] w-10 rounded-full bg-[#c4b59f]" />
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8175]">
          {page.section}
        </p>
        <blockquote className="mt-4 font-display text-[clamp(1.125rem,2.5vw,1.75rem)] font-medium italic leading-[1.4] text-[#2f2f2f]">
          &ldquo;{page.title}&rdquo;
        </blockquote>
        {page.subtitle && (
          <p className="mt-4 max-w-[320px] font-sans text-[14px] leading-[1.65] text-[#7a7268]">
            {page.subtitle}
          </p>
        )}
      </div>
    );
  }

  if (page.kind === "empty" && !page.title) {
    return <div className="flex h-full items-center justify-center" />;
  }

  if (page.kind === "empty") {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-4">
        <h3 className="font-display text-xl font-semibold text-[#2f2f2f]">{page.title}</h3>
        {page.subtitle && (
          <p className="mt-3 max-w-[300px] font-sans text-sm leading-relaxed text-[#7a7268]">
            {page.subtitle}
          </p>
        )}
      </div>
    );
  }

  const inner = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {page.section && (
          <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8175]">
            {page.section}
          </p>
        )}
        <h3 className="font-display text-[clamp(1.25rem,2.5vw,1.875rem)] font-bold leading-[1.15] tracking-tight text-[#1a1612]">
          {page.title}
        </h3>
        {page.subtitle && (
          <p className="mt-3 font-sans text-[15px] leading-[1.65] text-[#2f2f2f] line-clamp-6">
            {page.subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between pt-4">
        <p className="font-sans text-xs tabular-nums tracking-[0.12em] text-[#a09585]">
          {String(page.pageNum).padStart(2, "0")}
        </p>
        {page.href && (
          <span className="font-sans text-xs font-medium text-[#8a8175] transition-colors group-hover:text-[#1a1612]">
            Read →
          </span>
        )}
      </div>
    </div>
  );

  if (page.href) {
    return (
      <Link href={page.href} className="group block h-full no-underline">
        {inner}
      </Link>
    );
  }
  return inner;
}

function SpreadView({
  spread,
  totalPages,
  isMobile,
}: {
  spread: Spread;
  totalPages: number;
  isMobile: boolean;
}) {
  const pageStyle =
    "relative flex-1 min-w-0 overflow-hidden";
  const pageBg = "bg-[#fbf7ed]";
  const pagePad = isMobile ? "p-6 sm:p-8" : "p-10 lg:p-12";
  const pageBorder = "border border-[rgba(0,0,0,0.08)]";

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        <div className={`${pageStyle} ${pageBg} ${pagePad} ${pageBorder} rounded-xl min-h-[360px]`}>
          <PageContent page={spread.left} totalPages={totalPages} />
        </div>
        {(spread.right.kind !== "empty" || spread.right.title) && (
          <div className={`${pageStyle} ${pageBg} ${pagePad} ${pageBorder} rounded-xl min-h-[360px]`}>
            <PageContent page={spread.right} totalPages={totalPages} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="mx-auto grid min-h-[620px] overflow-hidden rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
      style={{
        gridTemplateColumns: "1fr 18px 1fr",
        width: "min(1200px, 92vw)",
      }}
    >
      {/* Left page */}
      <div className={`${pageStyle} ${pageBg} ${pagePad} ${pageBorder} rounded-l-xl border-r-0`}>
        <PageContent page={spread.left} totalPages={totalPages} />
      </div>

      {/* Center spine */}
      <div
        className="relative z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.12), rgba(255,255,255,0.4), rgba(0,0,0,0.10))",
        }}
        aria-hidden
      />

      {/* Right page */}
      <div className={`${pageStyle} ${pageBg} ${pagePad} ${pageBorder} rounded-r-xl border-l-0`}>
        <PageContent page={spread.right} totalPages={totalPages} />
      </div>
    </div>
  );
}

export function MagazineIssueView2({
  userId,
  magazineSlug,
  magazineName,
  magazineDescription,
  categorySlugs,
  publications,
}: Props) {
  const articleHref = useCallback(
    (contentSlug: string) =>
      `/magazines/${userId}/${magazineSlug}/${contentSlug}?layout=magazine`,
    [userId, magazineSlug]
  );

  const spreads = useMemo(
    () =>
      buildSpreads(
        publications,
        categorySlugs,
        magazineName,
        magazineDescription,
        articleHref
      ),
    [publications, categorySlugs, magazineName, magazineDescription, articleHref]
  );

  const totalPages = spreads.length > 0 ? spreads[spreads.length - 1].right.pageNum : 0;
  const [activeSpread, setActiveSpread] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const clamp = useCallback(
    (i: number) => Math.min(Math.max(0, i), Math.max(0, spreads.length - 1)),
    [spreads.length]
  );

  const goTo = useCallback((i: number) => setActiveSpread(clamp(i)), [clamp]);
  const next = useCallback(() => goTo(activeSpread + 1), [activeSpread, goTo]);
  const prev = useCallback(() => goTo(activeSpread - 1), [activeSpread, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const spread = spreads[activeSpread];
  if (!spread) return null;

  const progress = spreads.length > 0 ? ((activeSpread + 1) / spreads.length) * 100 : 0;

  return (
    <div className="magazine-view-2-issue relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f8f6f2] via-[#f3efe8] to-[#ece7df]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,255,255,0.5)_0%,transparent_55%)]"
        aria-hidden
      />

      <div
        className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8 md:px-6 md:py-12"
        role="region"
        aria-label="Magazine reader"
      >
        <SpreadView spread={spread} totalPages={totalPages} isMobile={isMobile} />

        {/* Navigation */}
        {spreads.length > 1 && !isMobile && (
          <>
            <button
              type="button"
              aria-label="Previous spread"
              onClick={prev}
              disabled={activeSpread === 0}
              className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/95 font-sans text-lg text-stone-800 shadow-[0_8px_24px_rgba(0,0,0,0.1)] backdrop-blur-sm transition hover:scale-105 hover:bg-white disabled:opacity-30 disabled:hover:scale-100 md:left-4"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next spread"
              onClick={next}
              disabled={activeSpread === spreads.length - 1}
              className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/95 font-sans text-lg text-stone-800 shadow-[0_8px_24px_rgba(0,0,0,0.1)] backdrop-blur-sm transition hover:scale-105 hover:bg-white disabled:opacity-30 disabled:hover:scale-100 md:right-4"
            >
              →
            </button>
          </>
        )}

        {/* Mobile nav */}
        {spreads.length > 1 && isMobile && (
          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={prev}
              disabled={activeSpread === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-sm disabled:opacity-30"
            >
              ←
            </button>
            <span className="font-sans text-sm font-medium text-[#555555]">
              {activeSpread + 1} of {spreads.length}
            </span>
            <button
              type="button"
              onClick={next}
              disabled={activeSpread === spreads.length - 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-sm disabled:opacity-30"
            >
              →
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="relative z-20 mt-6 flex flex-col items-center gap-3">
          <p className="font-sans text-sm font-medium tracking-[0.06em] text-[#555555]">
            {activeSpread + 1} of {spreads.length}
          </p>
          <div className="h-1 w-48 max-w-[min(100%,12rem)] overflow-hidden rounded-full bg-stone-900/10">
            <div
              className="h-full rounded-full bg-stone-800/70 transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Spreads">
            {spreads.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={i === activeSpread}
                aria-label={`Spread ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2 w-2 shrink-0 rounded-full transition-all duration-200 ${
                  i === activeSpread ? "scale-125 bg-stone-800" : "bg-stone-400/50 hover:bg-stone-500/70"
                }`}
              />
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
