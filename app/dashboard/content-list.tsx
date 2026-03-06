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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-muted text-sm font-medium">Category:</span>
        <button
          onClick={() => setCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            !selectedCategory
              ? "bg-neutral-800 text-white"
              : "bg-background border border-border text-muted hover:text-foreground hover:bg-neutral-50"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === c.slug
                ? "bg-neutral-800 text-white"
                : "bg-background border border-border text-muted hover:text-foreground hover:bg-neutral-50"
            }`}
          >
            {c.name}{c._count != null ? ` (${c._count.content})` : ""}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-muted text-sm font-medium">Tags:</span>
        {allTags.map((t) => (
          <button
            key={t.name}
            onClick={() => toggleTag(t.name)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              selectedTags.includes(t.name)
                ? "border-neutral-800 bg-neutral-100 text-foreground"
                : "border-border text-muted hover:text-foreground hover:bg-neutral-50"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {content.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-neutral-300 transition-colors"
          >
            <div>
              <Link
                href={`/dashboard/content/${item.id}`}
                className="font-medium text-accent hover:underline"
              >
                {slugToTitle(item.title)}
              </Link>
              <p className="text-muted text-sm mt-1">{item.category.name}</p>
              {item.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {item.tags.map(({ tag }) => (
                    <span
                      key={tag.name}
                      className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-muted"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link
              href={`/dashboard/content/${item.id}`}
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              Assign to magazine →
            </Link>
          </li>
        ))}
      </ul>
      {content.length === 0 && (
        <div className="rounded-xl bg-neutral-50 border border-border p-6 text-center">
          <p className="text-muted mb-3">No content yet.</p>
          <p className="text-sm text-foreground mb-4">
            Connect a GitHub repo in <Link href="/dashboard/source" className="text-accent font-medium hover:underline">Content source</Link> to sync .md files, or add content manually.
          </p>
          <Link
            href="/dashboard/source"
            className="inline-block px-4 py-2 rounded-lg bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-900 transition-colors"
          >
            Go to Content source
          </Link>
        </div>
      )}
    </div>
  );
}
