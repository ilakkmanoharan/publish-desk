/**
 * Ensures the first character of a string is uppercase. Rest unchanged.
 * e.g. "transparency before trust" → "Transparency before trust"
 */
export function capitalizeFirst(s: string): string {
  if (!s || typeof s !== "string") return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Converts a slug or lowercase-hyphenated string to title case with spaces.
 * e.g. "transparency-before-trust" → "Transparency before trust"
 * If the title has no hyphens, returns it with the first letter capitalized.
 */
export function slugToTitle(title: string): string {
  if (!title || typeof title !== "string") return title;
  if (!title.includes("-")) return capitalizeFirst(title);
  return title
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
