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
    <div>
      <h1 className="text-2xl font-bold mb-6">Magazines</h1>
      <p className="text-muted text-sm mb-6">
        Add magazines. They will appear on the public site when you publish content to them.
      </p>
      <MagazineForm userId={user.uid} onAdded={() => getUserMagazines(user.uid).then(setMagazines)} />
      <ul className="mt-8 space-y-3">
        {magazines.map((m) => (
          <li
            key={m.id}
            className="flex justify-between items-center p-4 rounded-lg bg-card border border-border"
          >
            <div>
              <span className="font-medium">{m.name}</span>
              <span className="text-muted text-sm ml-2">/{m.slug}</span>
              {m.description && (
                <p className="text-muted text-sm mt-1">{m.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {magazines.length === 0 && (
        <p className="text-muted mt-4">No magazines yet. Add one above.</p>
      )}
    </div>
  );
}
