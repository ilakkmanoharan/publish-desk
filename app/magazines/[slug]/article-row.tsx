"use client";

import Link from "next/link";
import { slugToTitle } from "@/lib/format-title";
import { useState } from "react";

type Props = {
  magazineSlug: string;
  contentSlug: string;
  title: string;
  publishedAt: Date | null;
};

export function ArticleRow({
  magazineSlug,
  contentSlug,
  title,
  publishedAt,
}: Props) {
  const [copied, setCopied] = useState(false);
  const displayTitle = slugToTitle(title);

  function getArticleUrl() {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/magazines/${magazineSlug}/${contentSlug}`;
  }

  async function copyLink() {
    const articleUrl = getArticleUrl();
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(articleUrl, "_blank");
    }
  }

  function shareOnX() {
    const articleUrl = getArticleUrl();
    const text = encodeURIComponent(displayTitle);
    const url = encodeURIComponent(articleUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer,width=550,height=420"
    );
  }

  return (
    <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
      {/* Title and date with explicit spacing */}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 min-w-0">
        <Link
          href={`/magazines/${magazineSlug}/${contentSlug}`}
          className="text-accent hover:underline font-semibold"
        >
          {displayTitle}
        </Link>
        {publishedAt && (
          <>
            <span className="text-muted text-sm" aria-hidden="true">
              ·
            </span>
            <span className="text-muted text-sm">
              {new Date(publishedAt).toLocaleDateString()}
            </span>
          </>
        )}
      </div>

      {/* Share section */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm text-muted hover:text-foreground"
          title="Copy link"
        >
          <CopyIcon />
          <span>Copy link</span>
        </button>
        <button
          type="button"
          onClick={shareOnX}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm text-muted hover:text-foreground"
          title="Share on X"
        >
          <XIcon />
          <span>Share on X</span>
        </button>
        {copied && (
          <span className="text-xs text-accent">Copied!</span>
        )}
      </div>
    </li>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
