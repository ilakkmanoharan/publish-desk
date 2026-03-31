"use client";

import { Children, isValidElement, useRef, type ImgHTMLAttributes, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { MagazineImage } from "@/components/magazine-view-2/MagazineImage";
import { parseMagazineImageAlt } from "@/components/magazine-view-2/MagazineMarkdownImage";

const proseClasses = `
  comic-reading-body
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

type ImgProps = ImgHTMLAttributes<HTMLImageElement>;

function ComicMarkdownImage({
  src,
  alt,
  loading,
  getNextPanel,
  ...rest
}: ImgProps & { getNextPanel: () => number }) {
  const { caption, fit } = parseMagazineImageAlt(alt);
  if (!src) return null;
  const panelNum = getNextPanel();
  return (
    <div className="comic-panel not-prose my-8 min-w-0">
      <p
        className="comic-panel-label mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]"
        aria-label={`Panel ${panelNum}`}
      >
        Panel {panelNum}
      </p>
      <div className="comic-panel-frame overflow-hidden rounded-sm bg-[#fafafa]">
        <MagazineImage
          src={src}
          alt={caption || ""}
          fit={fit}
          loading={loading ?? "lazy"}
          decoding="async"
          className="!h-auto !max-h-[min(85vh,1200px)] w-full !object-contain"
          {...rest}
        />
      </div>
    </div>
  );
}

function unwrapParagraphIfOnlyComicImage(children: ReactNode) {
  const kids = Children.toArray(children);
  if (kids.length === 1 && isValidElement(kids[0]) && kids[0].type === ComicMarkdownImage) {
    return kids[0];
  }
  return undefined;
}

/**
 * Single-column reading order with numbered “panels” for each markdown image—Western reading sequence, clear gutters.
 */
export function ArticleBodyComic({ content }: { content: string }) {
  const panelRef = useRef(0);
  panelRef.current = 0;
  const getNextPanel = () => {
    panelRef.current += 1;
    return panelRef.current;
  };

  return (
    <div className={proseClasses}>
      <ReactMarkdown
        components={{
          p: ({ children, ...props }) => {
            const unwrapped = unwrapParagraphIfOnlyComicImage(children);
            if (unwrapped !== undefined) return unwrapped;
            return <p {...props}>{children}</p>;
          },
          img: (props) => <ComicMarkdownImage {...props} getNextPanel={getNextPanel} />,
          figure: ({ children, ...props }) => (
            <figure {...props} className="comic-reading-figure my-6 min-w-0">
              {children}
            </figure>
          ),
          figcaption: ({ children, ...props }) => (
            <figcaption {...props} className="mt-2 text-center text-sm text-muted">
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
