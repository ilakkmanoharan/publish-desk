"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getMagazineByUserIdAndSlug,
  getPublishedPublicationsForMagazine,
  getContentById,
} from "@/lib/firestore/collections";
import { ArticleRow } from "./article-row";

function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (typeof (v as { toDate?: () => Date }).toDate === "function")
    return (v as { toDate: () => Date }).toDate();
  if (v instanceof Date) return v;
  return null;
}

export default function MagazinePage() {
  const params = useParams();
  const userId = params.userId as string;
  const slug = params.slug as string;
  const [magazine, setMagazine] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [publications, setPublications] = useState<
    { id: string; contentId: string; content: { title: string; slug: string }; publishedAt?: unknown }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMagazineByUserIdAndSlug(userId, slug).then(async (m) => {
      if (!m || cancelled) {
        setMagazine(null);
        setLoading(false);
        return;
      }
      setMagazine(m as { id: string; name: string; description?: string });
      const pubs = await getPublishedPublicationsForMagazine((m as { id: string }).id, userId);
      const withContent = await Promise.all(
        (pubs as { id: string; contentId: string; publishedAt?: unknown }[]).map(
          async (p) => {
            const content = await getContentById(p.contentId);
            return {
              ...p,
              content: (content as { title: string; slug: string }) || { title: "", slug: "" },
            };
          }
        )
      );
      if (!cancelled) {
        setPublications(withContent);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [userId, slug]);

  if (loading) return <div className="min-h-screen bg-background p-8">Loading...</div>;
  if (!magazine) return <div className="min-h-screen bg-background p-8">Magazine not found.</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-4xl flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-accent">
            Publish Desk
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← All magazines
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">{magazine.name}</h1>
        {magazine.description && (
          <p className="text-muted mb-8">{magazine.description}</p>
        )}
        <h2 className="text-lg font-semibold mb-4">Articles</h2>
        {publications.length === 0 ? (
          <p className="text-muted">No published articles yet.</p>
        ) : (
          <ul className="space-y-4">
            {publications.map((pub) => (
              <ArticleRow
                key={pub.id}
                userId={userId}
                magazineSlug={slug}
                contentSlug={pub.content.slug}
                title={pub.content.title}
                publishedAt={toDate(pub.publishedAt)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
