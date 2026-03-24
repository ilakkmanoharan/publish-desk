"use client";

import { Children, isValidElement, type ImgHTMLAttributes, type ReactNode } from "react";
import { MagazineImageFrame } from "./MagazineImageFrame";
import { MagazineImage } from "./MagazineImage";

/** Default contain for diagrams/screenshots; suffix alt with |cover for editorial photos. */
export function parseMagazineImageAlt(alt: string | undefined): {
  caption: string;
  fit: "cover" | "contain";
} {
  if (!alt) return { caption: "", fit: "contain" };
  if (/\|\s*cover\s*$/i.test(alt)) {
    return {
      caption: alt.replace(/\|\s*cover\s*$/i, "").trim(),
      fit: "cover",
    };
  }
  return { caption: alt, fit: "contain" };
}

type ImgProps = ImgHTMLAttributes<HTMLImageElement>;

/**
 * Single markdown image: wrapped in a fixed-ratio frame so multi-column layout never overlaps.
 */
export function MagazineMarkdownImage({ src, alt, loading, ...rest }: ImgProps) {
  const { caption, fit } = parseMagazineImageAlt(alt);
  if (!src) return null;
  return (
    <MagazineImageFrame ratio="landscape" className="my-6 magazine-grid-item">
      <MagazineImage
        src={src}
        alt={caption || ""}
        fit={fit}
        loading={loading ?? "lazy"}
        decoding="async"
        {...rest}
      />
    </MagazineImageFrame>
  );
}

MagazineMarkdownImage.displayName = "MagazineMarkdownImage";

/** If paragraph only wraps our markdown image, return it unwrapped (no <p> → avoids double box + overlap). */
export function unwrapParagraphIfOnlyMarkdownImage(children: ReactNode) {
  const kids = Children.toArray(children);
  if (kids.length === 1 && isValidElement(kids[0]) && kids[0].type === MagazineMarkdownImage) {
    return kids[0];
  }
  return undefined;
}
