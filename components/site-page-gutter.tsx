import type { ReactNode } from "react";

/** Centered column aligned with the app header: max 1200px + 32–48px horizontal padding. */
export function SitePageGutter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-[1200px] px-8 lg:px-12 ${className}`.trim()}>{children}</div>;
}
