"use client";

import type { ReactNode } from "react";

/** Layout ratios — frame height comes only from width × aspect-ratio (not from image intrinsics). */
export type MagazineFrameRatio = "landscape" | "square" | "portrait" | "wide";

type Props = {
  ratio?: MagazineFrameRatio;
  children: ReactNode;
  className?: string;
};

/**
 * Bounded media shell: overflow hidden + aspect-ratio reserves space (reduces CLS);
 * children fill the box so nothing can spill into adjacent columns/cards.
 */
export function MagazineImageFrame({ ratio = "landscape", children, className = "" }: Props) {
  return (
    <div className={`magazine-image-frame ${className}`.trim()} data-ratio={ratio}>
      {children}
    </div>
  );
}
