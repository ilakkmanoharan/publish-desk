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
        <span className="font-semibold text-foreground">
          ${premiumPriceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>{" "}
        USD — set by the publisher for this article
      </p>
    ) : (
      <p className="mt-2 font-sans text-sm text-muted">Ask the publication for pricing—no list price is shown for this article yet.</p>
    );

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
          Buy this article
        </h2>
        <p className="mx-auto mt-3 max-w-lg font-sans text-sm leading-relaxed text-muted md:text-base">
          {isAuthenticatedReader ? (
            <>
              <span className="font-medium text-foreground">{magazineName}</span> offers this piece as a{" "}
              <strong className="font-semibold text-foreground">one-time purchase</strong>. You&apos;re seeing a short
              preview—buy below to unlock and read the full article.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{magazineName}</span> sells this article individually—the
              publisher sets the price. You&apos;re seeing a preview only.{" "}
              <strong className="font-semibold text-foreground">Sign in or create an account</strong> to buy and read the
              rest.
            </>
          )}
        </p>
        {priceLine}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            href="/apps"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-[#924208] bg-accent px-8 font-sans text-base font-semibold text-white no-underline shadow-md transition-opacity hover:opacity-95 hover:no-underline"
          >
            Buy this article
          </Link>
          {isAuthenticatedReader ? (
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-slate-400 bg-slate-200 px-6 font-sans text-sm font-semibold text-slate-900 no-underline shadow-sm transition-colors hover:bg-slate-100"
            >
              Browse magazines
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-slate-400 bg-slate-200 px-6 font-sans text-sm font-semibold text-slate-900 no-underline shadow-sm transition-colors hover:bg-slate-100"
              >
                Log in to buy
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-[#924208] bg-accent px-6 font-sans text-sm font-semibold text-white no-underline shadow-md transition-opacity hover:opacity-95 hover:no-underline"
              >
                Sign up to buy
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
