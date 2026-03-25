"use client";

import Link from "next/link";
import type { Magazine } from "./types";
import { MagazineImageFrame } from "./MagazineImageFrame";
import { SitePageGutter } from "@/components/site-page-gutter";

type Props = {
  magazines: Magazine[];
  /** Appended to issue URLs (empty when Magazine View 2 is the URL default) */
  openIssueQuery: string;
};

/** Decorative card top — same containment rules as photos (16:9 frame, clip, no flex blowout). */
function PlaceholderCover({ seed }: { seed: string }) {
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <MagazineImageFrame ratio="landscape" className="shrink-0 rounded-t-xl rounded-b-none">
      <div
        className="bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(${h} 35% 22%), hsl(${(h + 40) % 360} 30% 18%))`,
        }}
        aria-hidden
      />
    </MagazineImageFrame>
  );
}

export function MagazineHubView2({ magazines, openIssueQuery }: Props) {
  const [featured, ...rest] = magazines;

  return (
    <div className="magazine-view-2-hub pb-16">
      <SitePageGutter>
        <section className="relative mb-10 flex min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 text-white shadow-md md:mb-14 md:min-h-[360px]">
          <div className="px-8 py-10 md:px-12 md:py-12">
            <div className="mx-auto w-full max-w-3xl">
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-stone-400">Publish Desk</p>
              <h1 className="mb-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                Magazines
              </h1>
              <p className="max-w-xl font-sans text-lg leading-relaxed text-stone-300">
                Browse editorial collections—story-driven reading, not just a feed.
              </p>
            </div>
          </div>
        </section>

        <div className="min-w-0">
          <figure className="my-12 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-10 shadow-sm md:my-16 md:px-10">
            <blockquote className="mx-auto max-w-3xl text-center font-display text-xl italic leading-snug text-[#111827] md:text-2xl">
              Strong hierarchy: headline, intro, body—calm typography that lets the writing lead.
            </blockquote>
          </figure>

        {featured && (
          <section className="mb-14 md:mb-20">
            <p className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-[#6B7280]">Featured</p>
            <Link
              href={`/magazines/${featured.userId}/${featured.slug}${openIssueQuery}`}
              className="group block min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-all no-underline hover:border-indigo-200 hover:shadow-md"
            >
              <PlaceholderCover seed={featured.id} />
              <div className="p-6 md:p-8">
                <h2 className="mb-2 font-display text-2xl font-semibold text-[#111827] transition-colors group-hover:text-accent md:text-3xl">
                  {featured.name}
                </h2>
                {featured.description && (
                  <p className="max-w-2xl font-sans text-base leading-relaxed text-[#6B7280]">
                    {featured.description}
                  </p>
                )}
                <span className="mt-4 inline-block text-sm font-medium text-accent">Open issue →</span>
              </div>
            </Link>
          </section>
        )}

        {rest.length > 0 && (
          <section>
            <p className="mb-2 font-sans text-xs uppercase tracking-[0.2em] text-[#6B7280]">More issues</p>
            <div className="mb-8 h-px bg-[#E5E7EB]" />
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
              {rest.map((m) => (
                <li key={`${m.userId}-${m.slug}`} className="magazine-grid-item min-w-0">
                  <Link
                    href={`/magazines/${m.userId}/${m.slug}${openIssueQuery}`}
                    className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition-all no-underline hover:border-indigo-200 hover:shadow-md"
                  >
                    <PlaceholderCover seed={m.id} />
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-2 font-display text-xl font-semibold text-[#111827] transition-colors group-hover:text-accent">
                        {m.name}
                      </h3>
                      {m.description && (
                        <p className="line-clamp-3 flex-1 font-sans text-sm leading-relaxed text-[#6B7280]">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        </div>
      </SitePageGutter>
    </div>
  );
}
