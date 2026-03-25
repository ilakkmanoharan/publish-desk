import type { ReactNode } from "react";

/** Centered column aligned with the app header: max 1200px + 24px horizontal padding. */
export function SitePageGutter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-[1200px] px-6 ${className}`.trim()}>{children}</div>;
}
