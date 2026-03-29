"use client";

import Link from "next/link";
import type { Magazine } from "./types";
import { MagazineImageFrame } from "./MagazineImageFrame";
import { SitePageGutter } from "@/components/site-page-gutter";

type Props = {
  magazines: Magazine[];
  /** Appended to issue URLs (empty when Magazine View 2 is the URL default) */
  openIssueQuery: string;
  /** Parent already wrapped in `SitePageGutter` (hero + filters live above). */
  contentOnly?: boolean;
};

/** Decorative card top — same containment rules as photos (16:9 frame, clip, no flex blowout). */
function PlaceholderCover({ seed }: { seed: string }) {
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <MagazineImageFrame ratio="landscape" className="shrink-0 rounded-t-xl rounded-b-none">
      {/* absolute inset-0: in-flow % height can collapse on some engines; ensures the whole cover is clickable inside the <Link> */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(${h} 35% 22%), hsl(${(h + 40) % 360} 30% 18%))`,
        }}
        aria-hidden
      />
    </MagazineImageFrame>
  );
}

export function MagazineHubView2({ magazines, openIssueQuery, contentOnly }: Props) {
  const [featured, ...rest] = magazines;

  const body = (
    <div className="relative isolate min-w-0">
          <figure className="mt-6 mb-12 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-10 shadow-sm md:mt-8 md:mb-16 md:px-10">
            <blockquote className="mx-auto max-w-3xl text-center font-display text-xl italic leading-snug text-[#111827] md:text-2xl">
              Strong hierarchy: headline, intro, body—calm typography that lets the writing lead.
            </blockquote>
          </figure>

        {featured && (
          <section className="relative z-10 mb-14 md:mb-20">
            <p className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-[#6B7280]">Featured</p>
            <Link
              href={`/magazines/${featured.userId}/${featured.slug}${openIssueQuery}`}
              className="group block min-w-0 cursor-pointer rounded-2xl no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-all group-hover:border-indigo-200 group-hover:shadow-md">
                <PlaceholderCover seed={featured.id} />
                <div className="relative z-10 bg-white p-6 md:p-8">
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
                    className="group flex h-full min-w-0 cursor-pointer flex-col rounded-xl no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition-all group-hover:border-indigo-200 group-hover:shadow-md">
                      <PlaceholderCover seed={m.id} />
                      <div className="relative z-10 flex flex-1 flex-col bg-white p-5">
                        <h3 className="mb-2 font-display text-xl font-semibold text-[#111827] transition-colors group-hover:text-accent">
                          {m.name}
                        </h3>
                        {m.description && (
                          <p className="line-clamp-3 flex-1 font-sans text-sm leading-relaxed text-[#6B7280]">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
    </div>
  );

  if (contentOnly) {
    return <div className="magazine-view-2-hub min-w-0">{body}</div>;
  }

  return (
    <div className="magazine-view-2-hub pb-16">
      <SitePageGutter>{body}</SitePageGutter>
    </div>
  );
}
