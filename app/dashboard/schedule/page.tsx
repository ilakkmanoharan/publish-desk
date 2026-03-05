import Link from "next/link";
import { prisma } from "@/lib/db";
import { slugToTitle } from "@/lib/format-title";

export default async function SchedulePage() {
  const scheduled = await prisma.publication.findMany({
    where: { status: { in: ["Scheduled", "Published"] } },
    include: {
      content: true,
      magazine: true,
    },
    orderBy: { scheduledAt: "asc" },
  });

  const byStatus = {
    Scheduled: scheduled.filter((p) => p.status === "Scheduled"),
    Published: scheduled.filter((p) => p.status === "Published"),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Schedule</h1>
      <p className="text-muted text-sm mb-8">
        Content assigned to magazines and their publish dates.
      </p>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Scheduled</h2>
        {byStatus.Scheduled.length === 0 ? (
          <p className="text-muted">No scheduled items.</p>
        ) : (
          <ul className="space-y-3">
            {byStatus.Scheduled.map((pub) => (
              <li
                key={pub.id}
                className="flex justify-between items-center p-4 rounded-lg bg-card border border-border"
              >
                <div>
                  <Link
                    href={`/dashboard/content/${pub.content.id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {slugToTitle(pub.content.title)}
                  </Link>
                  <p className="text-muted text-sm">
                    → {pub.magazine.name}
                  </p>
                </div>
                <span className="text-muted text-sm">
                  {pub.scheduledAt
                    ? new Date(pub.scheduledAt).toLocaleString()
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-4">Published</h2>
        {byStatus.Published.length === 0 ? (
          <p className="text-muted">No published items yet.</p>
        ) : (
          <ul className="space-y-3">
            {byStatus.Published.map((p) => (
              <li
                key={p.id}
                className="flex justify-between items-center p-4 rounded-lg bg-card border border-border"
              >
                <div>
                  <Link
                    href={`/magazines/${p.magazine.slug}/${p.content.slug}`}
                    className="font-medium text-accent hover:underline"
                    target="_blank"
                  >
                    {slugToTitle(p.content.title)}
                  </Link>
                  <p className="text-muted text-sm">in {p.magazine.name}</p>
                </div>
                <span className="text-muted text-sm">
                  {p.publishedAt
                    ? new Date(p.publishedAt).toLocaleDateString()
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
