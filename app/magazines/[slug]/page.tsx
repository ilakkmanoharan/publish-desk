import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArticleRow } from "./article-row";

export default async function MagazinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const magazine = await prisma.magazine.findUnique({
    where: { slug },
    include: {
      publications: {
        where: {
          status: "Published",
          publishedAt: { lte: new Date() },
        },
        include: { content: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!magazine) notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-4xl flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-accent">
            Publish Desk
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← All magazines
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">{magazine.name}</h1>
        {magazine.description && (
          <p className="text-muted mb-8">{magazine.description}</p>
        )}
        <h2 className="text-lg font-semibold mb-4">Articles</h2>
        {magazine.publications.length === 0 ? (
          <p className="text-muted">No published articles yet.</p>
        ) : (
          <ul className="space-y-4">
            {magazine.publications.map((pub) => (
              <ArticleRow
                key={pub.id}
                magazineSlug={magazine.slug}
                contentSlug={pub.content.slug}
                title={pub.content.title}
                publishedAt={pub.publishedAt}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
