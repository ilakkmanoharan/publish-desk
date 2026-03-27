"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  deletePublication,
  getContentById,
  getMagazineById,
  getPublicationsForMagazine,
  setMagazinePublicationSortOrder,
  updatePublicationDisplayTitle,
} from "@/lib/firestore/collections";
import { sortPublicationsByMagazineOrder } from "@/lib/publication-order";
import { slugToTitle } from "@/lib/format-title";

function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (typeof (v as { toDate?: () => Date }).toDate === "function")
    return (v as { toDate: () => Date }).toDate();
  if (v instanceof Date) return v;
  return null;
}

type Row = {
  publicationId: string;
  contentId: string;
  title: string;
  slug: string;
  status: string;
  displayTitle?: string | null;
  sortOrder?: number;
  scheduledAt: Date | null;
  publishedAt: Date | null;
};

export default function MagazineArticlesPage() {
  const params = useParams();
  const magazineId = params.magazineId as string;
  const { user } = useAuth();
  const [magazine, setMagazine] = useState<{
    name: string;
    slug: string;
    description?: string;
  } | null>(null);
  const [notAllowed, setNotAllowed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [savingTitleId, setSavingTitleId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const buildRowsFromPubs = useCallback(
    async (
      pubs: Awaited<ReturnType<typeof getPublicationsForMagazine>>
    ): Promise<Row[]> => {
      const uniqueContentIds = [...new Set(pubs.map((p) => p.contentId))];
      const contentEntries = await Promise.all(
        uniqueContentIds.map(async (id) => {
          const c = await getContentById(id);
          return [id, c] as const;
        })
      );
      const contentById = new Map(
        contentEntries.filter(([, c]) => c != null).map(([id, c]) => [id, c!])
      );

      const withContent: Row[] = pubs.map((p) => {
        const c = contentById.get(p.contentId);
        return {
          publicationId: p.id,
          contentId: p.contentId,
          title: c?.title ?? "…",
          slug: c?.slug ?? "",
          status: p.status,
          displayTitle: p.displayTitle,
          sortOrder: p.sortOrder,
          scheduledAt: toDate(p.scheduledAt),
          publishedAt: toDate(p.publishedAt),
        };
      });

      return sortPublicationsByMagazineOrder(
        withContent,
        (r) => r.publishedAt,
        (r) => slugToTitle(r.displayTitle || r.title)
      );
    },
    []
  );

  useEffect(() => {
    if (!user?.uid) return;

    if (!magazineId?.trim()) {
      setLoading(false);
      setNotAllowed(true);
      setMagazine(null);
      setRows([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setArticlesLoading(false);
      setLoadError(null);
      setNotAllowed(false);

      try {
        const mag = await getMagazineById(magazineId);
        if (cancelled) return;
        if (!mag || mag.userId !== user.uid) {
          setNotAllowed(true);
          setMagazine(null);
          setRows([]);
          return;
        }
        setNotAllowed(false);
        setMagazine({
          name: mag.name,
          slug: mag.slug,
          description: mag.description,
        });
        setLoading(false);
        setArticlesLoading(true);

        const pubs = await getPublicationsForMagazine(user.uid, magazineId);
        if (cancelled) return;
        const sortedRows = await buildRowsFromPubs(pubs);
        if (cancelled) return;
        setRows(sortedRows);
      } catch (e) {
        console.error("Magazine articles load failed", e);
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "Could not load articles. Check the browser console."
          );
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setArticlesLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, magazineId, buildRowsFromPubs]);

  async function persistOrder(nextRows: Row[]) {
    setReordering(true);
    setLoadError(null);
    try {
      await setMagazinePublicationSortOrder(nextRows.map((r) => r.publicationId));
      setRows(
        nextRows.map((r, index) => ({
          ...r,
          sortOrder: index,
        }))
      );
    } catch (e) {
      console.error(e);
      setLoadError(e instanceof Error ? e.message : "Could not save order.");
      if (user?.uid) {
        const pubs = await getPublicationsForMagazine(user.uid, magazineId);
        setRows(await buildRowsFromPubs(pubs));
      }
    } finally {
      setReordering(false);
    }
  }

  function moveRow(index: number, direction: -1 | 1) {
    const j = index + direction;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[index], next[j]] = [next[j], next[index]];
    void persistOrder(next);
  }

  async function handleRemove(publicationId: string) {
    const headline = slugToTitle(
      rows.find((r) => r.publicationId === publicationId)?.displayTitle ||
        rows.find((r) => r.publicationId === publicationId)?.title ||
        "this article"
    );
    if (!window.confirm(`Remove “${headline}” from this magazine? The article stays in your content library.`)) {
      return;
    }
    setDeletingId(publicationId);
    setLoadError(null);
    try {
      await deletePublication(publicationId);
      const next = rows.filter((r) => r.publicationId !== publicationId);
      setRows(next);
      if (next.length > 0) {
        await setMagazinePublicationSortOrder(next.map((r) => r.publicationId));
        setRows(
          next.map((r, i) => ({
            ...r,
            sortOrder: i,
          }))
        );
      }
    } catch (e) {
      console.error(e);
      setLoadError(e instanceof Error ? e.message : "Could not remove from magazine.");
      if (user?.uid) {
        const pubs = await getPublicationsForMagazine(user.uid, magazineId);
        setRows(await buildRowsFromPubs(pubs));
      }
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(r: Row) {
    setEditingId(r.publicationId);
    setEditDraft(slugToTitle(r.displayTitle || r.title));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft("");
  }

  async function saveEdit(publicationId: string) {
    const trimmed = editDraft.trim();
    const nextDisplay = trimmed.length === 0 ? null : trimmed;
    setSavingTitleId(publicationId);
    setLoadError(null);
    try {
      await updatePublicationDisplayTitle(publicationId, nextDisplay);
      setRows((prev) =>
        prev.map((r) =>
          r.publicationId === publicationId ? { ...r, displayTitle: nextDisplay } : r
        )
      );
      cancelEdit();
    } catch (e) {
      console.error(e);
      setLoadError(e instanceof Error ? e.message : "Could not save title.");
    } finally {
      setSavingTitleId(null);
    }
  }

  if (!user) return null;

  const back = (
    <Link
      href="/dashboard/magazines"
      className="text-sm text-muted hover:text-foreground mb-4 inline-block transition-colors"
    >
      ← Magazines
    </Link>
  );

  if (notAllowed) {
    return (
      <div className="max-w-2xl">
        {back}
        <p className="text-muted">Magazine not found.</p>
      </div>
    );
  }

  if (loading && !magazine) {
    return (
      <div className="max-w-2xl">
        {back}
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  if (!magazine) {
    return (
      <div className="max-w-2xl">
        {back}
        <p className="text-muted text-sm">
          {loadError ?? "Magazine not found."}
        </p>
      </div>
    );
  }

  const publicBase = `/magazines/${user.uid}/${magazine.slug}`;

  return (
    <div className="max-w-2xl">
      {back}
      <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
        {magazine.name}
      </h1>
      <div className="mb-6">
        <p className="text-muted text-sm">/{magazine.slug}</p>
        {magazine.description && (
          <p className="text-muted text-sm mt-2">{magazine.description}</p>
        )}
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-3">Articles in this magazine</h2>
      <p className="text-muted text-xs mb-3">
        Title edits apply only in this magazine (content library title is unchanged). Remove only unassigns from this magazine.
      </p>
      {loadError && (
        <p className="text-sm text-red-700 dark:text-red-400 mb-3">{loadError}</p>
      )}
      {articlesLoading ? (
        <p className="text-muted text-sm">Loading articles…</p>
      ) : rows.length === 0 && !loadError ? (
        <p className="text-muted text-sm">
          No content assigned yet. Assign pieces from{" "}
          <Link href="/dashboard/content" className="text-accent hover:opacity-90">
            Content
          </Link>
          .
        </p>
      ) : !loadError ? (
        <ul className={`space-y-3 ${reordering ? "opacity-70 pointer-events-none" : ""}`}>
          {rows.map((r, index) => {
            const headline = slugToTitle(r.displayTitle || r.title);
            const isEditing = editingId === r.publicationId;
            return (
              <li
                key={r.publicationId}
                className="p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors"
              >
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={index === 0 || reordering || !!deletingId}
                      onClick={() => moveRow(index, -1)}
                      className="px-2 py-1 rounded-lg text-sm border border-border text-muted hover:text-foreground hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={index === rows.length - 1 || reordering || !!deletingId}
                      onClick={() => moveRow(index, 1)}
                      className="px-2 py-1 rounded-lg text-sm border border-border text-muted hover:text-foreground hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      ↓
                    </button>
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                            autoFocus
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={!!savingTitleId}
                              onClick={() => saveEdit(r.publicationId)}
                              className="px-3 py-1.5 rounded-xl text-sm bg-accent text-white hover:opacity-90 disabled:opacity-50"
                            >
                              {savingTitleId === r.publicationId ? "Saving…" : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-3 py-1.5 rounded-xl text-sm border border-border text-muted hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                          <p className="text-xs text-muted">Leave blank to use the library title ({slugToTitle(r.title)}).</p>
                        </div>
                      ) : (
                        <>
                          <Link
                            href={`/dashboard/content/${r.contentId}`}
                            className="font-medium text-accent hover:opacity-90 no-underline transition-opacity"
                          >
                            {headline}
                          </Link>
                          <p className="text-muted text-sm mt-1">
                            {r.status}
                            {r.status === "Scheduled" && r.scheduledAt
                              ? ` · ${r.scheduledAt.toLocaleString()}`
                              : ""}
                            {r.status === "Published" && r.publishedAt
                              ? ` · ${r.publishedAt.toLocaleDateString()}`
                              : ""}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {!isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            disabled={!!deletingId || !!savingTitleId}
                            className="px-3 py-1.5 rounded-xl text-sm border border-border text-foreground hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                          >
                            Edit title
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(r.publicationId)}
                            disabled={deletingId === r.publicationId || !!savingTitleId}
                            className="px-3 py-1.5 rounded-xl text-sm border border-border text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
                          >
                            {deletingId === r.publicationId ? "Removing…" : "Remove"}
                          </button>
                        </>
                      )}
                      {r.status === "Published" && r.slug && !isEditing && (
                        <Link
                          href={`${publicBase}/${r.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted hover:text-foreground transition-colors"
                        >
                          View public →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
