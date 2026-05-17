"use client";

import ReactMarkdown from "react-markdown";
import {
  MagazineMarkdownImage,
  unwrapParagraphIfOnlyMarkdownImage,
} from "@/components/magazine-view-2/MagazineMarkdownImage";
import { articleMarkdownComponents, articleMarkdownRehypePlugins } from "@/lib/article-markdown";

const proseClasses = `
  magazine-reading-body
  prose prose-stone max-w-none
  prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
  prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:font-display prose-h2:border-b prose-h2:border-border prose-h2:pb-2
  prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-h3:font-display
  prose-p:my-4 prose-p:leading-[1.75] prose-p:text-[1.05rem] lg:prose-p:text-[1.125rem] prose-p:text-foreground/90
  prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
  prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
  prose-li:my-1
  prose-strong:font-semibold prose-strong:text-foreground
  prose-hr:border-border prose-hr:my-10
  prose-a:text-accent prose-a:no-underline prose-a:hover:underline
`;

export function ArticleBodyMagazine({ content }: { content: string }) {
  return (
    <div className={proseClasses}>
      <ReactMarkdown
        rehypePlugins={articleMarkdownRehypePlugins}
        components={{
          ...articleMarkdownComponents,
          p: ({ children, ...props }) => {
            const unwrapped = unwrapParagraphIfOnlyMarkdownImage(children);
            if (unwrapped !== undefined) return unwrapped;
            return <p {...props}>{children}</p>;
          },
          img: MagazineMarkdownImage,
          figure: ({ children, ...props }) => (
            <figure
              {...props}
              className="magazine-reading-figure magazine-grid-item min-w-0 max-w-full"
            >
              {children}
            </figure>
          ),
          figcaption: ({ children, ...props }) => (
            <figcaption {...props} className="mt-2 text-sm text-muted leading-snug">
              {children}
            </figcaption>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
