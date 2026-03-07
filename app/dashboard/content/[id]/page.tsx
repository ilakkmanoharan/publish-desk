"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  getUserContentById,
  getUserMagazines,
  getPublicationsForContent,
  getMagazineById,
  getUserCategories,
  getUserTags,
} from "@/lib/firestore/collections";
import { slugToTitle } from "@/lib/format-title";
import { AssignForm } from "./assign-form";

function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (typeof (v as { toDate?: () => Date }).toDate === "function")
    return (v as { toDate: () => Date }).toDate();
  if (v instanceof Date) return v;
  return null;
}

export default function ContentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [content, setContent] = useState<{
    title: string;
    excerpt?: string;
    categoryId: string;
    tagIds: string[];
    category?: { name: string };
    categorySlug?: string;
    tagNames?: string[];
  } | null>(null);
  const [magazines, setMagazines] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [publications, setPublications] = useState<
    { magazineId: string; magazineName: string; status: string; scheduledAt?: unknown; publishedAt?: unknown }[]
  >([]);

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([
      getUserContentById(user.uid, id),
      getUserCategories(user.uid),
      getUserTags(user.uid),
    ]).then(([c, categories, tags]) => {
      if (!c) {
        setContent(null);
        return;
      }
      const cat = (categories as { id: string; name: string; slug: string }[]).find(
        (x) => x.id === c.categoryId
      );
      const tagNames = (c.tagIds || []).map(
        (tid) => (tags as { id: string; name: string }[]).find((t) => t.id === tid)?.name
      ).filter(Boolean) as string[];
      setContent({
        categoryId: c.categoryId,
        title: c.title,
        excerpt: c.excerpt,
        tagIds: c.tagIds,
        category: cat ? { name: cat.name } : undefined,
        categorySlug: cat?.slug,
        tagNames,
      });
    });
    getUserMagazines(user.uid).then(setMagazines);
    getPublicationsForContent(user.uid, id).then(async (pubs) => {
      const withMag = await Promise.all(
        pubs.map(async (p) => {
            const mag = await getMagazineById(p.magazineId);
            return {
              ...p,
              magazineName: mag?.name ?? "",
            };
          })
      );
      setPublications(withMag);
    });
  }, [user?.uid, id]);

  if (!user) return null;
  if (!content) return <div className="p-8">Content not found.</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">{slugToTitle(content.title)}</h1>
      <p className="text-muted text-sm mb-4">
        {content.category?.name}
        {content.tagNames?.length ? ` · ${content.tagNames.join(", ")}` : ""}
      </p>
      {content.excerpt && (
        <p className="text-muted mb-6">{content.excerpt}</p>
      )}
      <h2 className="text-lg font-semibold mb-2">Assign to magazine</h2>
      <AssignForm
        userId={user.uid}
        contentId={id}
        contentTitle={content.title}
        contentCategorySlug={content.categorySlug ?? ""}
        contentTagNames={content.tagNames ?? []}
        magazines={magazines}
        existingPublications={publications.map((p) => ({ magazineId: p.magazineId }))}
        onAssigned={() => {
          getPublicationsForContent(user.uid, id).then(async (pubs) => {
            const withMag = await Promise.all(
              (pubs as { magazineId: string; status: string; scheduledAt?: unknown; publishedAt?: unknown }[]).map(
                async (p) => {
                  const mag = await getMagazineById(p.magazineId);
                  return {
                    ...p,
                    magazineName: (mag as { name: string })?.name ?? "",
                  };
                }
              )
            );
            setPublications(withMag);
          });
        }}
      />
      {publications.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-8 mb-2">Current assignments</h2>
          <ul className="space-y-2 text-sm">
            {publications.map((p) => (
              <li key={p.magazineId} className="flex justify-between items-center">
                <span>{p.magazineName}</span>
                <span className="text-muted">
                  {p.status}
                  {(p.scheduledAt || p.publishedAt)
                    ? ` · ${toDate(p.publishedAt ?? p.scheduledAt)?.toLocaleDateString() ?? ""}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
