"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  getUserPublications,
  getContentById,
  getMagazineById,
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

export default function SchedulePage() {
  const { user } = useAuth();
  const [scheduled, setScheduled] = useState<PubWithMeta[]>([]);
  const [published, setPublished] = useState<PubWithMeta[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    getUserPublications(user.uid, "Scheduled").then(async (pubs) => {
      const withMeta = await Promise.all(
        (pubs as { id: string; contentId: string; magazineId: string; scheduledAt?: unknown }[]).map(
          async (p) => {
            const [content, magazine] = await Promise.all([
              getContentById(p.contentId),
              getMagazineById(p.magazineId),
            ]);
            return {
              ...p,
              content: content as { title: string; slug: string },
              magazine: magazine as { name: string; slug: string; userId: string },
            };
          }
        )
      );
      setScheduled(withMeta);
    });
    getUserPublications(user.uid, "Published").then(async (pubs) => {
      const withMeta = await Promise.all(
        (pubs as { id: string; contentId: string; magazineId: string; publishedAt?: unknown }[]).map(
          async (p) => {
            const [content, magazine] = await Promise.all([
              getContentById(p.contentId),
              getMagazineById(p.magazineId),
            ]);
            return {
              ...p,
              content: content as { title: string; slug: string },
              magazine: magazine as { name: string; slug: string; userId: string },
            };
          }
        )
      );
      setPublished(withMeta);
    });
  }, [user?.uid]);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Schedule</h1>
      <p className="text-muted text-sm mb-8">
        Content assigned to magazines and their publish dates.
      </p>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Scheduled</h2>
        {scheduled.length === 0 ? (
          <p className="text-muted">No scheduled items.</p>
        ) : (
          <ul className="space-y-3">
            {scheduled.map((pub) => (
              <li
                key={pub.id}
                className="flex justify-between items-center p-4 rounded-lg bg-card border border-border"
              >
                <div>
                  <Link
                    href={`/dashboard/content/${pub.contentId}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {pub.content ? slugToTitle(pub.content.title) : "…"}
                  </Link>
                  <p className="text-muted text-sm">
                    → {pub.magazine?.name ?? "…"}
                  </p>
                </div>
                <span className="text-muted text-sm">
                  {pub.scheduledAt
                    ? toDate(pub.scheduledAt)?.toLocaleString() ?? "—"
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-4">Published</h2>
        {published.length === 0 ? (
          <p className="text-muted">No published items yet.</p>
        ) : (
          <ul className="space-y-3">
            {published.map((p) => (
              <li
                key={p.id}
                className="flex justify-between items-center p-4 rounded-lg bg-card border border-border"
              >
                <div>
                  <Link
                    href={
                      p.magazine
                        ? `/magazines/${p.magazine.userId}/${p.magazine.slug}/${p.content?.slug ?? ""}`
                        : "#"
                    }
                    className="font-medium text-accent hover:underline"
                    target="_blank"
                  >
                    {p.content ? slugToTitle(p.content.title) : "…"}
                  </Link>
                  <p className="text-muted text-sm">in {p.magazine?.name ?? "…"}</p>
                </div>
                <span className="text-muted text-sm">
                  {p.publishedAt
                    ? toDate(p.publishedAt)?.toLocaleDateString() ?? "—"
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
