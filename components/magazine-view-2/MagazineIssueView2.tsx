"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
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

const CARD_GAP = 40;

type ReaderPage = {
  key: string;
  section: string;
  title: string;
  subtitle?: string | null;
  href: string | null;
  seed: string;
  variant: "cover" | "article" | "quote" | "empty";
};

function gradientForSeed(seed: string, variant: ReaderPage["variant"]): CSSProperties {
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (variant === "cover") {
    return {
      backgroundImage: `linear-gradient(165deg, hsl(${h} 28% 12%) 0%, hsl(${(h + 45) % 360} 32% 18% 50%, #0c0a09 100%)`,
    };
  }
  if (variant === "quote") {
    return {
      backgroundImage: "linear-gradient(145deg, #e8e4dc 0%, #d4cdc2 50%, #c9bfb2 100%)",
    };
  }
  if (variant === "empty") {
    return {
      backgroundImage: "linear-gradient(145deg, #e7e5e0, #d8d6d0)",
    };
  }
  return {
    backgroundImage: `linear-gradient(145deg, hsl(${h} 32% 20%), hsl(${(h + 50) % 360} 28% 14%))`,
  };
}

function PortraitReaderCard({
  page,
  pageIndex,
  totalPages,
  isActive,
  distance,
  onActivate,
  cardWidth,
}: {
  page: ReaderPage;
  pageIndex: number;
  totalPages: number;
  isActive: boolean;
  distance: number;
  onActivate: () => void;
  cardWidth: number;
}) {
  const scaleClass =
    distance === 0 ? "scale-100 opacity-100 z-10 hover:scale-[1.03]" : distance === 1 ? "scale-[0.88] opacity-[0.76]" : "scale-[0.82] opacity-[0.52]";
  const blurClass = distance === 0 ? "" : "blur-[1.5px]";

  const cardBody = (
    <div
      className={[
        "flex h-full w-full flex-col overflow-hidden rounded-[18px] border border-stone-900/[0.06] bg-[#fdfcfa]",
        "shadow-[0_20px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]",
        "transition-[transform,box-shadow] duration-300 ease-out",
        isActive && page.href ? "cursor-pointer" : !isActive ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <div className="h-[60%] min-h-0 shrink-0 overflow-hidden rounded-t-[18px]">
        <div className="h-full w-full" style={gradientForSeed(page.seed, page.variant)} aria-hidden />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-between p-5">
        <div className="min-w-0">
          <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#888888]">
            {page.section}
          </p>
          <h2 className="font-display text-[20px] font-semibold leading-snug tracking-tight text-[#111111]">
            {page.title}
          </h2>
          {page.subtitle ? (
            <p className="mt-2 font-sans text-sm leading-relaxed text-[#666666] line-clamp-4">{page.subtitle}</p>
          ) : null}
        </div>
        <p className="pt-4 font-sans text-xs tracking-[0.15em] text-[#999999]">
          {String(pageIndex + 1).padStart(2, "0")} · {totalPages} pages
        </p>
      </div>
    </div>
  );

  const aspectShell = <div className="aspect-[3/4] w-full">{cardBody}</div>;

  const interactive =
    isActive && page.href ? (
      <Link href={page.href} className="block w-full no-underline">
        {aspectShell}
      </Link>
    ) : !isActive ? (
      <button
        type="button"
        className="block w-full border-0 bg-transparent p-0 text-left"
        onClick={onActivate}
        aria-label={`Go to page ${pageIndex + 1}`}
      >
        {aspectShell}
      </button>
    ) : (
      aspectShell
    );

  return (
    <div
      className={`shrink-0 origin-center transition-all duration-300 ease-out will-change-transform ${scaleClass} ${blurClass}`}
      style={{ width: cardWidth }}
    >
      {interactive}
    </div>
  );
}

function buildReaderPages(
  publications: PublicationCard[],
  categorySlugs: string[] | undefined,
  magazineName: string,
  magazineDescription: string | undefined,
  articleHref: (slug: string) => string
): ReaderPage[] {
  const sections = groupPublicationsByCategory(publications.slice(1), categorySlugs);
  const featured = publications[0];
  const pages: ReaderPage[] = [];

  pages.push({
    key: "cover",
    section: "Cover",
    title: magazineName,
    subtitle: magazineDescription ?? null,
    href: null,
    seed: magazineName,
    variant: "cover",
  });

  if (publications.length === 0) {
    pages.push({
      key: "empty",
      section: "Issue",
      title: "No published articles yet",
      subtitle: "Sync content from your source or add pieces from the dashboard.",
      href: null,
      seed: "empty",
      variant: "empty",
    });
    return pages;
  }

  if (featured) {
    pages.push({
      key: "featured",
      section: "Cover story",
      title: slugToTitle(featured.displayTitle ?? featured.content.title),
      subtitle: featured.content.excerpt ?? null,
      href: articleHref(featured.content.slug),
      seed: featured.id,
      variant: "article",
    });
  }

  pages.push({
    key: "pullquote",
    section: "From the editor",
    title: "Ideas worth a slower read",
    subtitle:
      "Section by section, like opening a print issue—calm typography that lets the writing lead.",
    href: null,
    seed: "quote",
    variant: "quote",
  });

  sections.forEach((section) => {
    section.items.forEach((pub) => {
      pages.push({
        key: pub.id,
        section: section.sectionLabel,
        title: slugToTitle(pub.displayTitle ?? pub.content.title),
        subtitle: pub.content.excerpt ?? null,
        href: articleHref(pub.content.slug),
        seed: pub.id,
        variant: "article",
      });
    });
  });

  return pages;
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

  const readerPages = useMemo(
    () => buildReaderPages(publications, categorySlugs, magazineName, magazineDescription, articleHref),
    [publications, categorySlugs, magazineName, magazineDescription, articleHref]
  );

  const pageCount = readerPages.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [cardWidth, setCardWidth] = useState(420);

  const clampIndex = useCallback(
    (i: number) => Math.min(Math.max(0, i), Math.max(0, pageCount - 1)),
    [pageCount]
  );

  const recenter = useCallback(() => {
    const vw = viewportRef.current?.clientWidth ?? 0;
    if (vw <= 0) return;
    const cw = Math.min(420, vw * 0.85);
    setCardWidth(cw);
    const step = cw + CARD_GAP;
    setTranslateX(vw / 2 - (activeIndex * step + cw / 2));
  }, [activeIndex]);

  useLayoutEffect(() => {
    recenter();
  }, [recenter, pageCount]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => recenter());
    ro.observe(el);
    return () => ro.disconnect();
  }, [recenter]);

  useEffect(() => {
    setActiveIndex((i) => clampIndex(i));
  }, [clampIndex, pageCount]);

  const goTo = useCallback(
    (i: number) => {
      setActiveIndex(clampIndex(i));
    },
    [clampIndex]
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      acc += e.deltaY;
      const threshold = 80;
      if (acc > threshold) {
        next();
        acc = 0;
      } else if (acc < -threshold) {
        prev();
        acc = 0;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [next, prev]);

  const progress = pageCount > 0 ? ((activeIndex + 1) / pageCount) * 100 : 0;

  return (
    <div className="magazine-view-2-issue relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f8f6f2] via-[#f3efe8] to-[#ece7df]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,255,255,0.5)_0%,transparent_55%)]"
        aria-hidden
      />

      <div
        ref={viewportRef}
        className="relative z-10 flex min-h-0 flex-1 flex-col items-stretch justify-center overflow-hidden"
        role="region"
        aria-label="Magazine reader"
      >
        <div className="relative flex min-h-0 flex-1 items-center overflow-visible py-6">
          <div
            className="flex items-center gap-[40px] px-4 transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] will-change-transform"
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {readerPages.map((page, i) => (
              <PortraitReaderCard
                key={page.key}
                page={page}
                pageIndex={i}
                totalPages={pageCount}
                isActive={i === activeIndex}
                distance={Math.abs(i - activeIndex)}
                onActivate={() => goTo(i)}
                cardWidth={cardWidth}
              />
            ))}
          </div>
        </div>

        {pageCount > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous page"
              onClick={prev}
              className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/95 font-sans text-lg text-stone-800 shadow-[0_8px_24px_rgba(0,0,0,0.1)] backdrop-blur-sm transition hover:scale-105 hover:bg-white md:left-8"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next page"
              onClick={next}
              className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white/95 font-sans text-lg text-stone-800 shadow-[0_8px_24px_rgba(0,0,0,0.1)] backdrop-blur-sm transition hover:scale-105 hover:bg-white md:right-8"
            >
              →
            </button>
          </>
        )}

        <footer className="relative z-20 flex shrink-0 flex-col items-center gap-4 px-6 pb-8 pt-2">
          <div className="flex flex-col items-center gap-3">
            <p className="font-sans text-sm font-medium tracking-[0.06em] text-[#555555]">
              {activeIndex + 1} of {pageCount}
            </p>
            <div className="h-1 w-48 max-w-[min(100%,12rem)] overflow-hidden rounded-full bg-stone-900/10">
              <div
                className="h-full rounded-full bg-stone-800/70 transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex max-w-full flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Pages">
              {readerPages.map((p, i) => (
                <button
                  key={`dot-${p.key}`}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Page ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-2 w-2 shrink-0 rounded-full transition-all duration-200 ${
                    i === activeIndex ? "scale-125 bg-stone-800" : "bg-stone-400/50 hover:bg-stone-500/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
