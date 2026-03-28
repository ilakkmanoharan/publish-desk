const DEFAULT_RATIO = 0.2;

/**
 * Returns roughly the first `ratio` of markdown, preferring paragraph boundaries.
 * If the first block exceeds the budget, it is trimmed (sentence boundary when possible).
 */
export function buildMarkdownTeaser(markdown: string, ratio = DEFAULT_RATIO): string {
  const trimmed = markdown.trim();
  if (!trimmed) return "";
  const target = Math.max(1, Math.floor(trimmed.length * ratio));
  if (trimmed.length <= target) return trimmed;

  const blocks = trimmed.split(/\n\n+/);
  let acc = "";

  for (const block of blocks) {
    const next = acc ? `${acc}\n\n${block}` : block;
    if (next.length >= target) {
      if (!acc) {
        return trimBlockToLength(block, target);
      }
      return acc;
    }
    acc = next;
  }

  return acc || trimmed.slice(0, target);
}

function trimBlockToLength(block: string, maxLen: number): string {
  if (block.length <= maxLen) return block;
  const slice = block.slice(0, maxLen);
  const lastPeriod = slice.lastIndexOf(". ");
  const lastNl = slice.lastIndexOf("\n");
  const snap = Math.max(
    lastPeriod > maxLen * 0.45 ? lastPeriod + 1 : -1,
    lastNl > maxLen * 0.35 ? lastNl : -1
  );
  const cut = snap > 0 ? snap : maxLen;
  return block.slice(0, cut).trimEnd();
}
