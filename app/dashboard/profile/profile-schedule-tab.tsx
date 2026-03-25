"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getContentById,
  getMagazineById,
  getUserPublications,
} from "@/lib/firestore/collections";
import { slugToTitle } from "@/lib/format-title";

function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (typeof (v as { toDate?: () => Date }).toDate === "function")
    return (v as { toDate: () => Date }).toDate();
  if (v instanceof Date) return v;
  return null;
}

type PubWithMeta = {
  id: string;
  contentId: string;
  magazineId: string;
  status: string;
  scheduledAt?: unknown;
  publishedAt?: unknown;
  content?: { title: string; slug: string };
  magazine?: { name: string; slug: string; userId: string };
};

export function ProfileScheduleTab({ userId }: { userId: string }) {
  const [scheduled, setScheduled] = useState<PubWithMeta[]>([]);
  const [published, setPublished] = useState<PubWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [schedPubs, pubPubs] = await Promise.all([
        getUserPublications(userId, "Scheduled"),
        getUserPublications(userId, "Published"),
      ]);
      type PubRow = {
        id: string;
        contentId: string;
        magazineId: string;
        status: string;
        scheduledAt?: unknown;
        publishedAt?: unknown;
      };
      const enrich = async (pubs: PubRow[]) =>
        Promise.all(
          pubs.map(async (p) => {
            const [content, magazine] = await Promise.all([
              getContentById(p.contentId),
              getMagazineById(p.magazineId),
            ]);
            return {
              ...p,
              content: content ? { title: content.title, slug: content.slug } : undefined,
              magazine: magazine
                ? { name: magazine.name, slug: magazine.slug, userId: magazine.userId ?? "" }
                : undefined,
            } satisfies PubWithMeta;
          })
        );
      const [s, p] = await Promise.all([
        enrich(schedPubs as PubRow[]),
        enrich(pubPubs as PubRow[]),
      ]);
      if (!cancelled) {
        setScheduled(s);
        setPublished(p);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <p className="font-sans text-sm text-[#6B7280]">Loading schedule…</p>;
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-xl font-semibold text-[#111827]">Scheduled</h2>
        <p className="mt-1 font-sans text-sm text-[#6B7280]">
          Content assigned to magazines with a future publish time.
        </p>
        {scheduled.length === 0 ? (
          <p className="mt-4 font-sans text-sm text-[#9CA3AF]">No scheduled items.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {scheduled.map((pub) => (
              <li
                key={pub.id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] p-4 ring-1 ring-black/[0.02] sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/content/${pub.contentId}`}
                    className="font-sans font-medium text-accent no-underline transition-opacity hover:opacity-90"
                  >
                    {pub.content ? slugToTitle(pub.content.title) : "…"}
                  </Link>
                  <p className="font-sans text-sm text-[#6B7280]">→ {pub.magazine?.name ?? "…"}</p>
                </div>
                <span className="shrink-0 font-sans text-sm text-[#6B7280]">
                  {pub.scheduledAt ? (toDate(pub.scheduledAt)?.toLocaleString() ?? "—") : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-[#111827]">Published</h2>
        <p className="mt-1 font-sans text-sm text-[#6B7280]">Live pieces on your public magazines.</p>
        {published.length === 0 ? (
          <p className="mt-4 font-sans text-sm text-[#9CA3AF]">No published items yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {published.map((p) => (
              <li
                key={p.id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] p-4 ring-1 ring-black/[0.02] sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <Link
                    href={
                      p.magazine
                        ? `/magazines/${p.magazine.userId}/${p.magazine.slug}/${p.content?.slug ?? ""}`
                        : "#"
                    }
                    className="font-sans font-medium text-accent no-underline transition-opacity hover:opacity-90"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {p.content ? slugToTitle(p.content.title) : "…"}
                  </Link>
                  <p className="font-sans text-sm text-[#6B7280]">in {p.magazine?.name ?? "…"}</p>
                </div>
                <span className="shrink-0 font-sans text-sm text-[#6B7280]">
                  {p.publishedAt ? (toDate(p.publishedAt)?.toLocaleDateString() ?? "—") : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="font-sans text-xs text-[#9CA3AF]">
        Full schedule view also lives at{" "}
        <Link href="/dashboard/schedule" className="text-accent no-underline hover:underline">
          Dashboard → Schedule
        </Link>
        .
      </p>
    </div>
  );
}
