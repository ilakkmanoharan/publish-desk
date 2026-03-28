import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export async function GET() {
  const fullPath = path.join(process.cwd(), "docs", "article-template.md");
  let source: string;
  try {
    source = readFileSync(fullPath, "utf-8");
  } catch {
    return new NextResponse("Article template file is not available.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(source, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="article-template.md"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
