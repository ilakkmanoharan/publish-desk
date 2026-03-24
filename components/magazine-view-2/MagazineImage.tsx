"use client";

import type { ImgHTMLAttributes } from "react";

export type MagazineImageFit = "cover" | "contain";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "className"> & {
  fit?: MagazineImageFit;
  className?: string;
};

/**
 * Fills the parent MagazineImageFrame only; never drives layout size.
 * - contain: diagrams, screenshots, charts (default in markdown)
 * - cover: editorial photos when alt ends with |cover
 */
export function MagazineImage({ fit = "contain", className = "", alt, ...rest }: Props) {
  return (
    <img
      alt={alt}
      className={`magazine-image ${fit === "cover" ? "magazine-image--cover" : "magazine-image--contain"} ${className}`.trim()}
      {...rest}
    />
  );
}
