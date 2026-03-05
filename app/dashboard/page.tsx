import { prisma } from "@/lib/db";
import { ContentList } from "./content-list";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string; category?: string }>;
}) {
  const { tags: tagsParam, category: categorySlug } = await searchParams;
  const tagNames = tagsParam ? tagsParam.split(",").map((t) => t.trim()) : [];

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { content: true } } },
  });

  const content = await prisma.content.findMany({
    where: {
      ...(categorySlug
        ? { category: { slug: categorySlug } }
        : {}),
      ...(tagNames.length > 0
        ? {
            tags: {
              some: {
                tag: { name: { in: tagNames } },
              },
            },
          }
        : {}),
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const allTags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Content library</h1>
      <ContentList
        content={content}
        categories={categories}
        allTags={allTags}
        selectedTags={tagNames}
        selectedCategory={categorySlug ?? null}
      />
    </div>
  );
}
