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
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl flex justify-between items-center px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-accent no-underline hover:opacity-90 transition-opacity">
            Publish Desk
          </Link>
          <nav className="flex items-center gap-5">
            {authLoading ? (
              <span className="text-muted text-sm">Loading...</span>
            ) : user ? (
              <>
                <Link href="/dashboard" className="text-sm text-muted hover:text-foreground no-underline transition-colors">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-sm text-muted hover:text-foreground bg-transparent border-0 cursor-pointer"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-muted hover:text-foreground no-underline transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-medium text-accent hover:underline">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Magazines</h1>
          <p className="text-muted text-lg">
            Browse magazines by category and tags.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mb-10">
          <input
            type="text"
            placeholder="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm w-52 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
          />
          <input
            type="text"
            placeholder="Filter by tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm w-52 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
          />
        </div>
        {loading ? (
          <div className="py-12 text-center text-muted">Loading magazines...</div>
        ) : magazines.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-10 text-center">
            <p className="text-muted mb-1">No magazines yet.</p>
            <p className="text-sm text-foreground">Sign up and create one from your dashboard.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {magazines.map((m) => (
              <li key={`${m.userId}-${m.slug}`}>
                <Link
                  href={`/magazines/${m.userId}/${m.slug}`}
                  className="block p-5 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-md transition-all duration-200 no-underline"
                >
                  <h2 className="font-semibold text-lg text-foreground">{m.name}</h2>
                  {m.description && (
                    <p className="text-muted text-sm mt-1.5">{m.description}</p>
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
