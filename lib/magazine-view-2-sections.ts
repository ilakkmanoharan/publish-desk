import { slugToTitle } from "@/lib/format-title";

export type PublicationCard = {
  id: string;
  contentId: string;
  displayTitle?: string | null;
  sortOrder?: number;
  publishedAt?: unknown;
  content: { title: string; slug: string; excerpt?: string; categorySlug?: string; visibility?: "public" | "private_link" };
};

/**
 * Group published articles into editorial sections using content.categorySlug
 * (set by GitHub sync or dashboard). Order sections by magazine.categorySlugs when present.
 */
export function groupPublicationsByCategory(
  publications: PublicationCard[],
  magazineCategorySlugs: string[] | undefined
): { sectionSlug: string; sectionLabel: string; items: PublicationCard[] }[] {
  const bySlug = new Map<string, PublicationCard[]>();
  for (const p of publications) {
    const raw = (p.content.categorySlug || "in-this-issue").toLowerCase();
    const key = raw.trim() || "in-this-issue";
    if (!bySlug.has(key)) bySlug.set(key, []);
    bySlug.get(key)!.push(p);
  }

  const order = (magazineCategorySlugs ?? []).map((s) => s.toLowerCase());
  const seen = new Set<string>();
  const out: { sectionSlug: string; sectionLabel: string; items: PublicationCard[] }[] = [];

  for (const slug of order) {
    const items = bySlug.get(slug);
    if (items?.length) {
      out.push({
        sectionSlug: slug,
        sectionLabel: slugToTitle(slug),
        items,
      });
      seen.add(slug);
    }
  }

  for (const [slug, items] of bySlug) {
    if (!seen.has(slug)) {
      out.push({
        sectionSlug: slug,
        sectionLabel: slug === "in-this-issue" ? "In this issue" : slugToTitle(slug),
        items,
      });
    }
  }

  return out;
}
