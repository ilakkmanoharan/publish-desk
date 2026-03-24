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
  tagIds: string[];
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
