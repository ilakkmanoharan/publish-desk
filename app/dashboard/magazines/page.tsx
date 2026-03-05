import { prisma } from "@/lib/db";
import { MagazineForm } from "./magazine-form";

export default async function MagazinesPage() {
  const magazines = await prisma.magazine.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { publications: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Magazines</h1>
      <p className="text-muted text-sm mb-6">
        Add and edit magazine names and details here. You can also maintain them in{" "}
        <code className="bg-card px-1 rounded">private/magazines.md</code> and sync later.
      </p>
      <MagazineForm />
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
            <span className="text-muted text-sm">{m._count.publications} articles</span>
          </li>
        ))}
      </ul>
      {magazines.length === 0 && (
        <p className="text-muted mt-4">No magazines yet. Add one above.</p>
      )}
    </div>
  );
}
