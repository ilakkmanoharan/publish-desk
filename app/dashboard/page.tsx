"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getUserCategories, getUserContent, getUserTags } from "@/lib/firestore/collections";
import { ContentList } from "./content-list";

export default function DashboardPage() {
  const { user } = useAuth();
  const [content, setContent] = useState<unknown[]>([]);
  const [categories, setCategories] = useState<unknown[]>([]);
  const [allTags, setAllTags] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    Promise.all([
      getUserCategories(user.uid),
      getUserTags(user.uid),
    ]).then(([cats, tags]) => {
      setCategories(cats);
      setAllTags(tags);
    });
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    getUserContent(user.uid, {
      categorySlug: selectedCategory || undefined,
      tagNames: selectedTags.length ? selectedTags : undefined,
    }).then((list) => {
      setContent(list);
      setLoading(false);
    });
  }, [user?.uid, selectedCategory, selectedTags]);

  const categoriesWithCount = (categories as { id: string; name: string; slug: string }[]).map(
    (c) => ({
      ...c,
      _count: {
        content: (content as { categoryId?: string }[]).filter((x) => x.categoryId === c.id).length,
      },
    })
  );
  const contentWithMeta = (content as { id: string; title: string; slug: string; excerpt?: string; categoryId?: string; tagIds?: string[] }[]).map(
    (c) => ({
      ...c,
      category:
        (categories as { id: string; name: string; slug: string }[]).find(
          (cat) => cat.id === c.categoryId
        ) || { name: "", slug: "" },
      tags: (c.tagIds || [])
        .map((tid) =>
          (allTags as { id: string; name: string }[]).find((t) => t.id === tid)
        )
        .filter(Boolean)
        .map((t) => ({ tag: { name: t!.name } })),
    })
  );

  if (!user) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content library</h1>
        <Link
          href="/dashboard/content/new"
          className="px-4 py-2 rounded bg-accent text-background text-sm font-medium hover:opacity-90"
        >
          New content
        </Link>
      </div>
      <ContentList
        content={contentWithMeta}
        categories={categoriesWithCount}
        allTags={allTags as { id: string; name: string }[]}
        selectedTags={selectedTags}
        selectedCategory={selectedCategory}
        onTagChange={setSelectedTags}
        onCategoryChange={setSelectedCategory}
      />
      {loading && <p className="text-muted">Loading...</p>}
    </div>
  );
}
