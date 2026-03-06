"use client";

import { useState } from "react";
import { upsertPublication, addMagazineSlugsForPublish } from "@/lib/firestore/collections";

type Magazine = { id: string; name: string; slug: string };

export function AssignForm({
  userId,
  contentId,
  contentCategorySlug,
  contentTagNames,
  magazines,
  existingPublications,
  onAssigned,
}: {
  userId: string;
  contentId: string;
  contentCategorySlug: string;
  contentTagNames: string[];
  magazines: Magazine[];
  existingPublications: { magazineId: string }[];
  onAssigned: () => void;
}) {
  const [magazineId, setMagazineId] = useState("");
  const [status, setStatus] = useState<"Draft" | "Scheduled" | "Published">("Scheduled");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availableMagazines = magazines.filter(
    (m) => !existingPublications.some((p) => p.magazineId === m.id)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!magazineId) return;
    setSubmitting(true);
    try {
      const scheduled =
        status === "Scheduled" && scheduledAt ? new Date(scheduledAt) : null;
      const published =
        status === "Published" ? new Date() : null;
      await upsertPublication(userId, {
        contentId,
        magazineId,
        status,
        scheduledAt: scheduled,
        publishedAt: published,
      });
      if (status === "Published" && contentCategorySlug) {
        await addMagazineSlugsForPublish(
          magazineId,
          contentCategorySlug,
          contentTagNames
        );
      }
      onAssigned();
    } finally {
      setSubmitting(false);
    }
  }

  if (magazines.length === 0) {
    return (
      <p className="text-muted text-sm">
        No magazines yet. Add one in{" "}
        <a href="/dashboard/magazines" className="text-accent hover:underline">
          Magazines
        </a>
        .
      </p>
    );
  }

  if (availableMagazines.length === 0) {
    return (
      <p className="text-muted text-sm">This content is already assigned to all magazines.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-muted mb-1">Magazine</label>
        <select
          value={magazineId}
          onChange={(e) => setMagazineId(e.target.value)}
          className="w-full px-3 py-2 rounded bg-card border border-border text-foreground"
          required
        >
          <option value="">Select...</option>
          {availableMagazines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "Draft" | "Scheduled" | "Published")}
          className="w-full px-3 py-2 rounded bg-card border border-border text-foreground"
        >
          <option value="Draft">Draft</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Published">Publish now</option>
        </select>
      </div>
      {status === "Scheduled" && (
        <div>
          <label className="block text-sm text-muted mb-1">Scheduled date (required)</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-3 py-2 rounded bg-card border border-border text-foreground"
            required
          />
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 rounded bg-accent text-background font-medium disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Assign"}
      </button>
    </form>
  );
}
