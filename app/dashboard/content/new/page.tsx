"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  getUserCategories,
  createCategory,
  createTag,
  createContent,
} from "@/lib/firestore/collections";

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function NewContentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    getUserCategories(user.uid).then(setCategories);
  }, [user?.uid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid) return;
    setSubmitting(true);
    try {
      let catId = categoryId;
      if (newCategoryName.trim()) {
        const slug = slugify(newCategoryName.trim());
        await createCategory(user.uid, newCategoryName.trim(), slug);
        const updated = await getUserCategories(user.uid);
        const newCat = updated.find((c) => c.slug === slug);
        catId = newCat?.id ?? catId;
      }
      if (!catId) {
        alert("Select a category or enter a new category name.");
        setSubmitting(false);
        return;
      }
      const tagNames = tagsStr.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      const tagIds: string[] = [];
      for (const name of tagNames) {
        const id = await createTag(user.uid, name);
        tagIds.push(id);
      }
      const contentSlug = slug.trim() || slugify(title);
      await createContent(user.uid, {
        title: title.trim(),
        slug: contentSlug,
        body: body.trim(),
        excerpt: excerpt.trim() || undefined,
        categoryId: catId,
        tagIds,
      });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">New content</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-muted mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setSlug(slugify(e.target.value));
            }}
            className="w-full px-3 py-2 rounded bg-card border border-border text-foreground"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 rounded bg-card border border-border text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Excerpt (optional)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-3 py-2 rounded bg-card border border-border text-foreground"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 rounded bg-card border border-border text-foreground"
          >
            <option value="">Select or add new below</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Or type new category name"
            className="w-full mt-2 px-3 py-2 rounded bg-card border border-border text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="e.g. tech, howto"
            className="w-full px-3 py-2 rounded bg-card border border-border text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Body (Markdown)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 rounded bg-card border border-border text-foreground font-mono text-sm"
            rows={12}
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-accent text-background font-medium disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create content"}
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded border border-border text-muted hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
