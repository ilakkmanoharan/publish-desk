"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getAllMagazines } from "@/lib/firestore/collections";

type Magazine = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
};

export default function HomePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    getAllMagazines(category || undefined, tag || undefined).then((list) => {
      setMagazines(list as Magazine[]);
      setLoading(false);
    });
  }, [category, tag]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-4xl flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-accent">
            Publish Desk
          </Link>
          <nav className="flex items-center gap-4">
            {authLoading ? (
              <span className="text-muted text-sm">Loading...</span>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted hover:text-foreground"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-sm text-muted hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-muted hover:text-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm text-accent hover:underline"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Magazines</h1>
        <p className="text-muted mb-6">
          Browse magazines by category and tags.
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          <input
            type="text"
            placeholder="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded bg-card border border-border text-foreground text-sm w-48"
          />
          <input
            type="text"
            placeholder="Filter by tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="px-3 py-2 rounded bg-card border border-border text-foreground text-sm w-48"
          />
        </div>
        {loading ? (
          <p className="text-muted">Loading magazines...</p>
        ) : magazines.length === 0 ? (
          <p className="text-muted">No magazines yet. Sign up and create one from your dashboard.</p>
        ) : (
          <ul className="space-y-4">
            {magazines.map((m) => (
              <li key={`${m.userId}-${m.slug}`}>
                <Link
                  href={`/magazines/${m.userId}/${m.slug}`}
                  className="block p-4 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors"
                >
                  <h2 className="font-semibold text-lg">{m.name}</h2>
                  {m.description && (
                    <p className="text-muted text-sm mt-1">{m.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
