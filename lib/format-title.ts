/**
 * Converts a slug or lowercase-hyphenated string to title case with spaces.
 * e.g. "transparency-before-trust" → "Transparency before trust"
 * If the title already has spaces or mixed case, it is returned unchanged.
 */
export function slugToTitle(title: string): string {
  if (!title || typeof title !== "string") return title;
  if (!title.includes("-")) return title;
  return title
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
