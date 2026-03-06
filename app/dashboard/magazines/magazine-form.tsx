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

  function onNameChange(value: string) {
    setName(value);
    if (!slug || slug === slugify(name)) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createMagazine(userId, {
        name: name.trim(),
        slug: (slug || slugify(name)).trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setSlug("");
      setDescription("");
      onAdded();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg bg-card border border-border max-w-md space-y-4">
      <div>
        <label className="block text-sm text-muted mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
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
          className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
          placeholder="example-tech-digest"
        />
        <p className="text-xs text-muted mt-1">Auto-filled from the name. Used in the public URL (e.g. /magazines/you/systems-mind). You can edit it if needed.</p>
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
          rows={2}
          placeholder="Short description for the magazine."
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 rounded bg-accent text-background font-medium disabled:opacity-50"
      >
        {submitting ? "Adding..." : "Add magazine"}
      </button>
    </form>
  );
}
