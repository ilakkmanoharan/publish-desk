import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  magazineName: string;
  premiumPriceUsd?: number | null;
  /** Signed in as a reader (not the publisher) */
  isAuthenticatedReader: boolean;
  children: ReactNode;
};

export function PremiumBadge() {
  return (
    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/90 bg-amber-50 px-3.5 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-amber-950 shadow-sm">
      <span className="text-amber-600" aria-hidden>
        ★
      </span>
      Premium article
    </p>
  );
}

export function PremiumArticleGate({
  magazineName,
  premiumPriceUsd,
  isAuthenticatedReader,
  children,
}: Props) {
  const priceLine =
    typeof premiumPriceUsd === "number" &&
    !Number.isNaN(premiumPriceUsd) &&
    premiumPriceUsd > 0 ? (
      <p className="mt-2 font-sans text-sm text-muted">
        Full access from{" "}
        <span className="font-semibold text-foreground">
          ${premiumPriceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>{" "}
        USD
      </p>
    ) : null;

  return (
    <div className="premium-article-gate relative">
      <div className="relative overflow-hidden">
        {children}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-b from-transparent via-background/90 to-background"
          aria-hidden
        />
      </div>
      <div className="relative z-[2] -mt-12 border-t border-border/60 bg-background px-4 pb-14 pt-10 text-center md:-mt-14 md:pt-12">
        <h2 className="mx-auto max-w-md font-display text-2xl font-bold leading-snug tracking-tight text-foreground md:text-3xl">
          Subscribe to read the full story
        </h2>
        <p className="mx-auto mt-3 max-w-lg font-sans text-sm leading-relaxed text-muted md:text-base">
          {isAuthenticatedReader ? (
            <>
              You&apos;re signed in, but this premium story isn&apos;t unlocked for your account yet. The publisher
              can connect paid plans later; for now you&apos;re seeing about one-fifth of the article.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{magazineName}</span> published this as a premium story.
              You&apos;re seeing a short preview—roughly the first 20%—before the paywall.
            </>
          )}
        </p>
        {priceLine}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticatedReader ? (
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-border bg-card px-6 font-sans text-sm font-semibold text-foreground no-underline shadow-sm transition-colors hover:bg-stone-50"
            >
              Browse magazines
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-border bg-card px-6 font-sans text-sm font-semibold text-foreground no-underline shadow-sm transition-colors hover:bg-stone-50"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-6 font-sans text-sm font-semibold text-white no-underline shadow-sm transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
