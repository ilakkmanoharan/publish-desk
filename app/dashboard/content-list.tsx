"use client";

import Link from "next/link";
import { slugToTitle } from "@/lib/format-title";

type ContentItem = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category: { name: string; slug: string };
  tags: { tag: { name: string } }[];
};
type Category = { id: string; name: string; slug: string; _count?: { content: number } };
type Tag = { id: string; name: string };

export function ContentList({
  content,
  categories,
  allTags,
  selectedTags,
  selectedCategory,
  onTagChange,
  onCategoryChange,
}: {
  content: ContentItem[];
  categories: Category[];
  allTags: Tag[];
  selectedTags: string[];
  selectedCategory: string | null;
  onTagChange?: (tags: string[]) => void;
  onCategoryChange?: (slug: string | null) => void;
}) {
  function toggleTag(name: string) {
    if (!onTagChange) return;
    const next = selectedTags.includes(name)
      ? selectedTags.filter((t) => t !== name)
      : [...selectedTags, name];
    onTagChange(next);
  }

  function setCategory(slug: string | null) {
    onCategoryChange?.(slug);
  }

  return (
    <div className="mx-auto w-full max-w-[68rem]">
      <div className="sticky top-0 z-20 -mx-1 mb-4 border-b border-border bg-card px-1 pb-4 pt-1 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-muted text-xs font-semibold uppercase tracking-wide shrink-0">
            Category
          </span>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !selectedCategory
                  ? "bg-accent text-white shadow-sm"
                  : "bg-background border border-border text-muted hover:text-foreground hover:bg-neutral-50"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === c.slug
                    ? "bg-accent text-white shadow-sm"
                    : "bg-background border border-border text-muted hover:text-foreground hover:bg-neutral-50"
                }`}
              >
                {c.name}
                {c._count != null ? ` (${c._count.content})` : ""}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center mt-3">
          <span className="text-muted text-xs font-semibold uppercase tracking-wide shrink-0">
            Tags
          </span>
          {allTags.length === 0 ? (
            <span className="text-xs text-muted">—</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 items-center">
              {allTags.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => toggleTag(t.name)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedTags.includes(t.name)
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border/80 bg-muted/30 text-muted hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {content.map((item, index) => {
          const showCategory =
            !selectedCategory && Boolean(item.category.name?.trim());
          const hasTags = item.tags.length > 0;

          return (
            <li key={item.id}>
              <article
                className="group rounded-lg border border-border bg-background px-4 py-3 transition-all duration-200 hover:border-neutral-300 hover:bg-[#f9f9f9] hover:shadow-sm"
              >
                <div className="flex gap-3 items-start">
                  <span
                    className="flex h-7 min-w-[1.75rem] shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-[11px] font-semibold tabular-nums text-muted"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/dashboard/content/${item.id}`}
                        className="min-w-0 text-base font-semibold leading-snug text-foreground no-underline hover:text-accent transition-colors line-clamp-2"
                      >
                        {slugToTitle(item.title)}
                      </Link>
                      <Link
                        href={`/dashboard/content/${item.id}`}
                        className="shrink-0 inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground no-underline shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        aria-label={`Assign ${slugToTitle(item.title)} to a magazine`}
                      >
                        Assign
                        <span aria-hidden className="text-muted">
                          →
                        </span>
                      </Link>
                    </div>
                    {(showCategory || hasTags) && (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pt-0.5">
                        {showCategory && (
                          <span className="text-xs text-muted">{item.category.name}</span>
                        )}
                        {showCategory && hasTags && (
                          <span className="text-muted/40 select-none" aria-hidden>
                            ·
                          </span>
                        )}
                        {hasTags && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.tags.map(({ tag }) => (
                              <span
                                key={tag.name}
                                className="inline-flex items-center rounded-full border border-border/70 bg-muted/25 px-2 py-0.5 text-[11px] font-medium text-muted"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {content.length === 0 && (
        <div className="rounded-xl bg-muted/20 border border-border p-8 text-center mt-4">
          <p className="text-muted mb-2">No content yet.</p>
          <p className="text-sm text-foreground mb-5">
            Connect a GitHub repo in{" "}
            <Link href="/dashboard/source" className="text-accent font-medium hover:underline">
              Content source
            </Link>{" "}
            to sync .md files, or add content manually.
          </p>
          <Link
            href="/dashboard/source"
            className="inline-block px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity no-underline"
          >
            Go to Content source
          </Link>
        </div>
      )}
    </div>
  );
}
