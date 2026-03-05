import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugToTitle } from "@/lib/format-title";
import { ArticleBody } from "./article-body";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string; contentSlug: string }>;
}) {
  const { slug, contentSlug } = await params;
  const magazine = await prisma.magazine.findUnique({ where: { slug } });
  if (!magazine) notFound();

  const publication = await prisma.publication.findFirst({
    where: {
      magazineId: magazine.id,
      content: { slug: contentSlug },
      status: "Published",
      publishedAt: { lte: new Date() },
    },
    include: { content: true },
  });

  if (!publication) notFound();
  const content = publication.content;

  const displayTitle = slugToTitle(content.title);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-4xl flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-accent">
            Publish Desk
          </Link>
          <Link
            href={`/magazines/${slug}`}
            className="text-sm text-muted hover:text-foreground"
          >
            ← {magazine.name}
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">{displayTitle}</h1>
        {publication.publishedAt && (
          <p className="text-muted text-sm mb-6">
            {new Date(publication.publishedAt).toLocaleDateString()} · {magazine.name}
          </p>
        )}
        {content.excerpt && (
          <p className="text-lg text-muted mb-8">{content.excerpt}</p>
        )}
        <ArticleBody content={content.body} />
      </article>
    </div>
  );
}
