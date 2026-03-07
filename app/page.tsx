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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-[-220px] -z-0 mx-auto h-[420px] max-w-5xl rounded-full bg-accent/10 blur-3xl" />
      <header className="sticky top-0 z-10 border-b border-border/70 bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-accent no-underline hover:opacity-90 transition-opacity">
            Publish Desk
          </Link>
          <nav className="flex items-center gap-5">
            {authLoading ? (
              <span className="text-muted text-sm">Loading...</span>
            ) : user ? (
              <>
                <Link href="/dashboard" className="text-sm text-muted no-underline transition-colors hover:text-foreground">
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
                <Link href="/login" className="text-sm text-muted no-underline transition-colors hover:text-foreground">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-sm font-medium text-accent no-underline transition-colors hover:bg-accent/20"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="relative z-0 mx-auto max-w-5xl px-6 py-14">
        <section className="mb-10 rounded-3xl border border-border/80 bg-card/80 p-8 shadow-sm">
          <p className="mb-3 inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Discover independent publications
          </p>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Find your next favorite magazine</h1>
          <p className="max-w-2xl text-lg text-muted">
            Explore beautifully curated issues from creators around the world. Filter by topics and tags to jump straight into what you care about.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="rounded-full border border-border bg-background px-3 py-1">{magazines.length} publications</span>
            <span className="rounded-full border border-border bg-background px-3 py-1">Updated in real-time</span>
            <span className="rounded-full border border-border bg-background px-3 py-1">Open to all readers</span>
          </div>
        </section>

        <div className="mb-10 grid gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">Category</span>
            <input
              type="text"
              placeholder="e.g. Design, Tech, Culture"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-shadow"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">Tag</span>
            <input
              type="text"
              placeholder="e.g. startup, travel, ai"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-shadow"
            />
          </label>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted">Loading magazines...</div>
        ) : magazines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="mb-1 text-muted">No magazines match your filters yet.</p>
            <p className="text-sm text-foreground">Try another category/tag or create your own from the dashboard.</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {magazines.map((m) => (
              <li key={`${m.userId}-${m.slug}`}>
                <Link
                  href={`/magazines/${m.userId}/${m.slug}`}
                  className="group block h-full rounded-2xl border border-border bg-card p-6 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
                >
                  <p className="mb-4 inline-flex rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted">
                    {m.slug}
                  </p>
                  <h2 className="text-lg font-semibold text-foreground">{m.name}</h2>
                  {m.description && (
                    <p className="mt-2 text-sm text-muted">{m.description}</p>
                  )}
                  <p className="mt-5 text-sm font-medium text-accent transition-transform group-hover:translate-x-1">Read magazine →</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
