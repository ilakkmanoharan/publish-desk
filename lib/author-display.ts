const KNOWN_AUTHORS: Record<string, string> = {
  ilak: "Ilakkuvaselvi (Ilak) Manoharan",
};

export function getAuthorDisplayName(author: string | undefined | null): string {
  if (!author) return KNOWN_AUTHORS.ilak;
  const key = author.trim().toLowerCase();
  return KNOWN_AUTHORS[key] ?? author.trim();
}
