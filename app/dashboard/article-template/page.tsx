import Link from "next/link";
import { readFileSync } from "fs";
import path from "path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Article template",
  description: "Optional Publish Desk YAML front matter for GitHub-synced Markdown.",
};

export default function ArticleTemplatePage() {
  const fullPath = path.join(process.cwd(), "docs", "article-template.md");
  let source: string;
  try {
    source = readFileSync(fullPath, "utf-8");
  } catch {
    source =
      "Could not load docs/article-template.md. If you self-host Publish Desk, ensure that file exists in the repository.";
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="font-sans text-sm">
        <Link
          href="/dashboard"
          className="font-medium text-accent no-underline hover:underline"
        >
          ← Dashboard
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
        Article template
      </h1>
      <p className="mt-2 font-sans text-sm leading-relaxed text-[#64748B]">
        Copy the block below into your <code className="rounded bg-[#F1F5F9] px-1 font-mono text-[13px]">.md</code>{" "}
        files in GitHub when you want optional front matter: title, magazines, tags, category, and{" "}
        <strong className="font-semibold text-[#475569]">Premium</strong> vs{" "}
        <strong className="font-semibold text-[#475569]">free</strong> via the{" "}
        <code className="rounded bg-[#F1F5F9] px-1 font-mono text-[12px]">publish_desk</code> block. Then sync from{" "}
        <Link href="/dashboard/source" className="font-medium text-accent no-underline hover:underline">
          Content source
        </Link>
        .
      </p>
      <p className="mt-2 font-sans text-xs text-[#94A3B8]">
        Source in the repo:{" "}
        <a
          href="/api/article-template"
          download="article-template.md"
          className="font-medium text-accent no-underline hover:underline"
        >
          Download article-template.md
        </a>
        <span className="text-[#94A3B8]">
          {" "}
          (<code className="font-mono text-[11px]">docs/article-template.md</code>)
        </span>
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#0F172A] shadow-sm">
        <div className="border-b border-white/10 px-4 py-2 font-sans text-xs font-medium text-[#94A3B8]">
          Full template (YAML + body)
        </div>
        <pre className="max-h-[min(70vh,42rem)] overflow-auto p-4 font-mono text-[13px] leading-relaxed text-[#E2E8F0] whitespace-pre-wrap break-words">
          {source}
        </pre>
      </div>
    </div>
  );
}
