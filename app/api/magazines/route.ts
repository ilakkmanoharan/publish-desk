import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const slugFinal = (slug && String(slug).trim()) || slugify(name.trim());

    const magazine = await prisma.magazine.create({
      data: {
        name: name.trim(),
        slug: slugFinal,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(magazine);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A magazine with this slug already exists" },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create magazine" },
      { status: 500 }
    );
  }
}
