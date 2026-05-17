import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inference in AI: From Tokens to Thinking",
  description:
    "The definitive visual guide to AI inference — from first principles through GPU serving, optimization, reasoning-time compute, and the economics of production AI.",
};

export default function InferenceArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
