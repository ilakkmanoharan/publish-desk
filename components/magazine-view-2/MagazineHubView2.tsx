"use client";

import Link from "next/link";
import type { Magazine } from "./types";

type Props = {
  magazines: Magazine[];
  /** Appended to issue URLs (e.g. ?view=magazine2) */
  openIssueQuery: string;
};

function PlaceholderCover({ seed }: { seed: string }) {
  const h = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="aspect-[16/10] w-full rounded-xl bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900"
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${h} 35% 22%), hsl(${(h + 40) % 360} 30% 18%))`,
      }}
      aria-hidden
    />
  );
}

export function MagazineHubView2({ magazines, openIssueQuery }: Props) {
  const [featured, ...rest] = magazines;

  return (
    <div className="magazine-view-2-hub pb-16">
      <section className="relative min-h-[280px] md:min-h-[360px] flex flex-col justify-end bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 text-white px-6 py-10 md:px-10 md:py-12 mb-10 md:mb-14">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3 font-sans">
            Publish Desk
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Magazines
          </h1>
          <p className="text-lg text-stone-300 max-w-xl font-sans leading-relaxed">
            Browse editorial collections—story-driven reading, not just a feed.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <figure className="my-12 md:my-16 border-y border-border py-10 px-4 md:px-8">
          <blockquote className="font-display text-xl md:text-2xl italic text-center text-foreground leading-snug max-w-3xl mx-auto">
            Strong hierarchy: headline, intro, body—calm typography that lets the writing lead.
          </blockquote>
        </figure>

        {featured && (
          <section className="mb-14 md:mb-20">
            <p className="text-xs tracking-[0.2em] uppercase text-muted mb-4 font-sans">Featured</p>
            <Link
              href={`/magazines/${featured.userId}/${featured.slug}${openIssueQuery}`}
              className="group block no-underline rounded-2xl border border-border overflow-hidden bg-card hover:border-accent/40 transition-all shadow-sm hover:shadow-md"
            >
              <PlaceholderCover seed={featured.id} />
              <div className="p-6 md:p-8">
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                  {featured.name}
                </h2>
                {featured.description && (
                  <p className="text-muted font-sans text-base leading-relaxed max-w-2xl">
                    {featured.description}
                  </p>
                )}
                <span className="inline-block mt-4 text-sm font-medium text-accent">Open issue →</span>
              </div>
            </Link>
          </section>
        )}

        {rest.length > 0 && (
          <section>
            <p className="text-xs tracking-[0.2em] uppercase text-muted mb-2 font-sans">More issues</p>
            <div className="h-px bg-border mb-8" />
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {rest.map((m) => (
                <li key={`${m.userId}-${m.slug}`}>
                  <Link
                    href={`/magazines/${m.userId}/${m.slug}${openIssueQuery}`}
                    className="group block no-underline rounded-xl border border-border overflow-hidden bg-card hover:border-accent/40 transition-all h-full flex flex-col"
                  >
                    <PlaceholderCover seed={m.id} />
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                        {m.name}
                      </h3>
                      {m.description && (
                        <p className="text-muted text-sm leading-relaxed line-clamp-3 font-sans flex-1">
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
    </div>
  );
}
