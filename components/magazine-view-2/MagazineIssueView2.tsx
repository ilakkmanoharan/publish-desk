"use client";

import Link from "next/link";
import { slugToTitle } from "@/lib/format-title";
import {
  groupPublicationsByCategory,
  type PublicationCard,
} from "@/lib/magazine-view-2-sections";
import { MagazineImageFrame } from "./MagazineImageFrame";

type Props = {
  userId: string;
  magazineSlug: string;
  magazineName: string;
  magazineDescription?: string;
  categorySlugs?: string[];
  publications: PublicationCard[];
};

function CardCover({ seed }: { seed: string }) {
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <MagazineImageFrame ratio="landscape" className="shrink-0 rounded-t-xl rounded-b-none">
      <div
        className="bg-gradient-to-br from-stone-800 to-stone-950"
        style={{
          backgroundImage: `linear-gradient(145deg, hsl(${h} 32% 20%), hsl(${(h + 50) % 360} 28% 14%))`,
        }}
        aria-hidden
      />
    </MagazineImageFrame>
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
  const articleHref = (contentSlug: string) =>
    `/magazines/${userId}/${magazineSlug}/${contentSlug}?layout=magazine`;

  const [featured, ...others] = publications;
  const sections = groupPublicationsByCategory(others, categorySlugs);

  return (
    <div className="magazine-view-2-issue pb-20">
      <section className="relative min-h-[300px] md:min-h-[380px] flex flex-col justify-end bg-gradient-to-b from-stone-950 via-stone-900 to-stone-800 text-white px-6 py-10 md:px-12 md:py-14 mb-0">
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-xs tracking-[0.25em] uppercase text-stone-400 mb-3 font-sans">
            {magazineName}
          </p>
          <h1 className="font-display text-4xl md:text-[2.75rem] font-bold tracking-tight leading-[1.1] mb-4">
            {magazineName}
          </h1>
          {magazineDescription && (
            <p className="text-lg text-stone-300 max-w-2xl font-sans leading-relaxed">
              {magazineDescription}
            </p>
          )}
        </div>
      </section>

      {publications.length === 0 ? (
        <div className="mx-auto max-w-3xl px-6 py-16 text-muted font-sans">No published articles yet.</div>
      ) : (
        <div className="mx-auto max-w-5xl px-6 md:px-10 min-w-0">
          {featured && (
            <section className="pt-12 md:pt-16 pb-4 min-w-0">
              <p className="text-xs tracking-[0.2em] uppercase text-muted mb-4 font-sans">Cover story</p>
              <Link
                href={articleHref(featured.content.slug)}
                className="group block no-underline rounded-2xl border border-border overflow-hidden bg-card hover:border-accent/40 transition-all shadow-sm min-w-0"
              >
                <CardCover seed={featured.id} />
                <div className="p-6 md:p-8">
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground group-hover:text-accent transition-colors mb-3 leading-tight">
                    {slugToTitle(featured.displayTitle ?? featured.content.title)}
                  </h2>
                  {featured.content.excerpt && (
                    <p className="text-muted font-sans text-base leading-relaxed max-w-3xl line-clamp-4">
                      {featured.content.excerpt}
                    </p>
                  )}
                  <span className="inline-block mt-5 text-sm font-medium text-accent">Read article →</span>
                </div>
              </Link>
            </section>
          )}

          <figure className="my-14 md:my-16 border-y border-border py-8 px-2">
            <blockquote className="font-display text-lg md:text-xl italic text-center text-foreground/90 leading-snug max-w-2xl mx-auto">
              Ideas worth a slower read—section by section, like opening a print issue.
            </blockquote>
          </figure>

          {sections.map((section) => (
            <section key={section.sectionSlug} className="mb-12 md:mb-16">
              <header className="mb-6">
                <h3 className="text-xs tracking-[0.2em] uppercase text-muted font-sans font-medium">
                  {section.sectionLabel}
                </h3>
                <div className="h-px bg-border mt-3 max-w-full" />
              </header>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {section.items.map((pub) => (
                  <li key={pub.id} className="magazine-grid-item min-w-0">
                    <Link
                      href={articleHref(pub.content.slug)}
                      className="group block no-underline rounded-xl border border-border overflow-hidden bg-card hover:border-accent/40 transition-all h-full min-w-0 flex flex-col"
                    >
                      <CardCover seed={pub.id} />
                      <div className="p-5 flex flex-col flex-1">
                        <h4 className="font-display text-lg font-semibold text-foreground group-hover:text-accent transition-colors leading-snug mb-2">
                          {slugToTitle(pub.displayTitle ?? pub.content.title)}
                        </h4>
                        {pub.content.excerpt && (
                          <p className="text-muted text-sm leading-relaxed line-clamp-3 font-sans flex-1">
                            {pub.content.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
