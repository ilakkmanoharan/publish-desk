import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contentId, magazineId, status, scheduledAt, publishedAt } = body;

    if (!contentId || !magazineId) {
      return NextResponse.json(
        { error: "contentId and magazineId required" },
        { status: 400 }
      );
    }

    const scheduled = scheduledAt ? new Date(scheduledAt) : null;
    const published = publishedAt ? new Date(publishedAt) : null;

    const publication = await prisma.publication.upsert({
      where: {
        contentId_magazineId: { contentId, magazineId },
      },
      create: {
        contentId,
        magazineId,
        status: status || "Draft",
        scheduledAt: scheduled,
        publishedAt: published ?? (status === "Published" ? new Date() : null),
      },
      update: {
        status: status || "Draft",
        scheduledAt: scheduled,
        publishedAt: published ?? undefined,
      },
    });

    return NextResponse.json(publication);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create or update publication" },
      { status: 500 }
    );
  }
}
