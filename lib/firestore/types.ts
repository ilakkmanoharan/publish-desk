export type Category = {
  id: string;
  userId: string;
  name: string;
  slug: string;
};

export type Tag = {
  id: string;
  userId: string;
  name: string;
};

export type Content = {
  id: string;
  userId: string;
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  categoryId: string;
  /** Denormalized folder slug (sync + new content); used for public Magazine View 2 sections. */
  categorySlug?: string;
  tagIds: string[];
  /** When true, treat as premium-only (e.g. gate in readers); set via optional `publish_desk` YAML on GitHub sync or dashboard. */
  premiumOnly?: boolean;
  /** Optional list price in USD dollars (e.g. 100 = $100, 100.55 = $100.55). Omitted or null when not set. */
  premiumPriceUsd?: number | null;
  /** Public reader layout for this article. `magazine` = default multi-column issue style; `comic` = single column with numbered panels. */
  readerLayout?: "magazine" | "comic";
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
};

export type Magazine = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  notes?: string;
  categorySlugs?: string[];
  tagNames?: string[];
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
};

export type Publication = {
  id: string;
  userId: string;
  contentId: string;
  magazineId: string;
  status: "Draft" | "Scheduled" | "Published";
  /** Optional display title for this magazine; if unset, content.title is used (with first letter capitalized). */
  displayTitle?: string | null;
  /** Order within the magazine (0 = first). Omitted on older documents until reordered. */
  sortOrder?: number;
  scheduledAt?: { toDate: () => Date } | null;
  publishedAt?: { toDate: () => Date } | null;
  createdAt: { toDate: () => Date };
  updatedAt: { toDate: () => Date };
};
