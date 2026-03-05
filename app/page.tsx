import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const magazines = await prisma.magazine.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-4xl flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-accent">
            Publish Desk
          </Link>
          {process.env.NODE_ENV === "development" && (
            <Link
              href="/dashboard"
              className="text-sm text-muted hover:text-foreground"
            >
              Dashboard
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Magazines</h1>
        <p className="text-muted mb-8">
          Browse published magazines and articles.
        </p>
        {magazines.length === 0 ? (
          <p className="text-muted">No magazines yet. Add them from the dashboard.</p>
        ) : (
          <ul className="space-y-4">
            {magazines.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/magazines/${m.slug}`}
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
