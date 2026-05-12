import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nature Foundation Models — AI Infrastructure for Natural Systems",
  description:
    "A 15-minute technical presentation on AI infrastructure for understanding, simulating, and designing natural systems.",
};

export default function PresentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
