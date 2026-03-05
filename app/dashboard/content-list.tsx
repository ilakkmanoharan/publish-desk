"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { slugToTitle } from "@/lib/format-title";

type ContentItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: { name: string; slug: string };
  tags: { tag: { name: string } }[];
};
type Category = { name: string; slug: string; _count: { content: number } };
type Tag = { name: string };

export function ContentList({
  content,
  categories,
  allTags,
  selectedTags,
  selectedCategory,
}: {
  content: ContentItem[];
  categories: Category[];
  allTags: Tag[];
  selectedTags: string[];
  selectedCategory: string | null;
}) {
  const router = useRouter();

  function toggleTag(name: string) {
    const next = selectedTags.includes(name)
      ? selectedTags.filter((t) => t !== name)
      : [...selectedTags, name];
    const q = new URLSearchParams();
    if (next.length) q.set("tags", next.join(","));
    if (selectedCategory) q.set("category", selectedCategory);
    router.push("/dashboard?" + q.toString());
  }

  function setCategory(slug: string | null) {
    const q = new URLSearchParams();
    if (selectedTags.length) q.set("tags", selectedTags.join(","));
    if (slug) q.set("category", slug);
    router.push("/dashboard?" + q.toString());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <span className="text-muted text-sm">Category:</span>
        <button
          onClick={() => setCategory(null)}
          className={`px-3 py-1 rounded text-sm ${
            !selectedCategory ? "bg-accent text-background" : "bg-card text-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setCategory(c.slug)}
            className={`px-3 py-1 rounded text-sm ${
              selectedCategory === c.slug ? "bg-accent text-background" : "bg-card text-muted hover:text-foreground"
            }`}
          >
            {c.name} ({c._count.content})
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-muted text-sm">Tags:</span>
        {allTags.map((t) => (
          <button
            key={t.name}
            onClick={() => toggleTag(t.name)}
            className={`px-3 py-1 rounded text-sm border ${
              selectedTags.includes(t.name)
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-foreground"
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
            className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
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
                      className="text-xs px-2 py-0.5 rounded bg-border text-muted"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Link
              href={`/dashboard/content/${item.id}`}
              className="text-sm text-muted hover:text-accent"
            >
              Assign to magazine →
            </Link>
          </li>
        ))}
      </ul>
      {content.length === 0 && (
        <p className="text-muted">No content found. Run the import script to add content from private/content-ready.</p>
      )}
    </div>
  );
}
