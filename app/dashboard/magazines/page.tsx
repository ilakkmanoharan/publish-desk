"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserMagazines } from "@/lib/firestore/collections";
import { MagazineForm } from "./magazine-form";

export default function MagazinesPage() {
  const { user } = useAuth();
  const [magazines, setMagazines] = useState<{ id: string; name: string; slug: string; description?: string }[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    getUserMagazines(user.uid).then(setMagazines);
  }, [user?.uid]);

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">Magazines</h1>
      <p className="text-muted text-sm mb-6">
        Add magazines — they’re the “containers” for your content on the public site. Content comes from your GitHub repo (Content source); magazines are what you create here and assign that content to. Each magazine gets a URL like /magazines/you/slug.
      </p>
      <MagazineForm userId={user.uid} onAdded={() => getUserMagazines(user.uid).then(setMagazines)} />
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">Your magazines</h2>
        {magazines.length === 0 ? (
          <p className="text-muted text-sm">No magazines yet. Add one above.</p>
        ) : (
      <ul className="space-y-3">
        {magazines.map((m) => (
          <li
            key={m.id}
            className="flex justify-between items-center p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors"
          >
            <div>
              <span className="font-medium text-foreground">{m.name}</span>
              <span className="text-muted text-sm ml-2">/{m.slug}</span>
              {m.description && (
                <p className="text-muted text-sm mt-1">{m.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
        )}
      </div>
    </div>
  );
}
