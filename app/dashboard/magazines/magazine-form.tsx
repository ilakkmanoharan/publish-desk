"use client";

import { useState } from "react";
import { createMagazine } from "@/lib/firestore/collections";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function MagazineForm({
  userId,
  onAdded,
}: {
  userId: string;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onNameChange(value: string) {
    setName(value);
    if (!slug || slug === slugify(name)) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const savedName = name.trim();
      const desc = description.trim();
      await createMagazine(userId, {
        name: savedName,
        slug: (slug || slugify(name)).trim(),
        ...(desc ? { description: desc } : {}),
      });
      setName("");
      setSlug("");
      setDescription("");
      setSuccess(`"${savedName}" created successfully.`);
      onAdded();
    } catch (err: unknown) {
      console.error("Failed to create magazine:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to create magazine. Check the browser console for details.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          placeholder="e.g. Example Tech Digest"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Slug (URL)</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          placeholder="example-tech-digest"
        />
        <p className="text-xs text-muted mt-1">Auto-filled from the name. Used in the public URL (e.g. /magazines/you/systems-mind). You can edit it if needed.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          rows={2}
          placeholder="Short description for the magazine."
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2.5 rounded-xl bg-accent text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? "Adding..." : "Add magazine"}
      </button>
    </form>
  );
}
