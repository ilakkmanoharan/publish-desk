import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ASRA — Adaptive Scientific Reasoning Architecture",
  description:
    "Intelligence as adaptive strategy formation in unfamiliar environments — a visual guide to ASRA, modern AI limits, and the path beyond memorization.",
};

export default function AsraArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
