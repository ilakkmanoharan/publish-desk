/**
 * Sort publications for a magazine: explicit sortOrder first; legacy docs without
 * sortOrder fall back to publishedAt, then title key.
 */
export function sortPublicationsByMagazineOrder<T extends { sortOrder?: number; publishedAt?: unknown }>(
  items: T[],
  getPublishedAt: (item: T) => Date | null,
  getTitleSortKey: (item: T) => string
): T[] {
  return [...items].sort((a, b) => {
    const ao = a.sortOrder;
    const bo = b.sortOrder;
    const hasA = typeof ao === "number" && !Number.isNaN(ao);
    const hasB = typeof bo === "number" && !Number.isNaN(bo);
    if (hasA && hasB && ao !== bo) return ao - bo;
    if (hasA && !hasB) return -1;
    if (!hasA && hasB) return 1;
    const ta = getPublishedAt(a)?.getTime() ?? 0;
    const tb = getPublishedAt(b)?.getTime() ?? 0;
    if (ta !== tb) return ta - tb;
    return getTitleSortKey(a).localeCompare(getTitleSortKey(b), undefined, { sensitivity: "base" });
  });
}
