import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugToTitle } from "@/lib/format-title";
import { AssignForm } from "./assign-form";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      publications: { include: { magazine: true } },
    },
  });

  if (!content) notFound();

  const magazines = await prisma.magazine.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">{slugToTitle(content.title)}</h1>
      <p className="text-muted text-sm mb-4">
        {content.category.name}
        {content.tags.length > 0 && (
          <> · {content.tags.map((t) => t.tag.name).join(", ")}</>
        )}
      </p>
      {content.excerpt && (
        <p className="text-muted mb-6">{content.excerpt}</p>
      )}
      <h2 className="text-lg font-semibold mb-2">Assign to magazine</h2>
      <AssignForm
        contentId={content.id}
        magazines={magazines}
        existingPublications={content.publications}
      />
      {content.publications.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-8 mb-2">Current assignments</h2>
          <ul className="space-y-2 text-sm">
            {content.publications.map((pub) => (
              <li key={pub.id} className="flex justify-between items-center">
                <span>{pub.magazine.name}</span>
                <span className="text-muted">
                  {pub.status}
                  {pub.scheduledAt && ` · ${new Date(pub.publishedAt ?? pub.scheduledAt).toLocaleDateString()}`}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
