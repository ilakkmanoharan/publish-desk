/**
 * Optional Publish Desk YAML block in synced Markdown.
 * When `publish_desk_active` is true and a `publish_desk` object exists, those fields
 * override path/legacy front matter for GitHub sync. Otherwise behavior is unchanged.
 */

export function isPublishDeskFrontMatterActive(raw: Record<string, unknown>): boolean {
  return (
    raw.publish_desk_active === true ||
    raw.publish_desk_active === "true" ||
    raw.publishDeskActive === true ||
    raw.publishDeskActive === "true"
  );
}

export function getPublishDeskBlock(raw: Record<string, unknown>): Record<string, unknown> | null {
  const a = raw.publish_desk;
  const b = raw.publishDesk;
  if (a && typeof a === "object" && !Array.isArray(a)) return a as Record<string, unknown>;
  if (b && typeof b === "object" && !Array.isArray(b)) return b as Record<string, unknown>;
  return null;
}

export function normalizeTagNames(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
}

/** Magazine slugs as listed in the repo (matched against Firestore `magazines.slug`). */
export function normalizeMagazineSlugs(v: unknown): string[] {
  if (typeof v === "string") {
    return v
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(v)) return [];
  return v.map((s) => String(s).trim()).filter(Boolean);
}

export function deskPremiumOnly(desk: Record<string, unknown>): boolean {
  if (desk.premium === true || desk.premium === "true") return true;
  const access = String(desk.access ?? "").toLowerCase();
  if (access === "premium") return true;
  const tier = String(desk.content_tier ?? desk.contentTier ?? "").toLowerCase();
  return tier === "premium";
}
