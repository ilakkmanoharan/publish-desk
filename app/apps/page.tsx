import type { Metadata } from "next";
import Link from "next/link";
import { ANDROID_PLAY_STORE_URL, IOS_APP_STORE_URL } from "@/lib/mobile-app-links";

export const metadata: Metadata = {
  title: "Get the app",
  description: "Download Publish Desk for iOS and Android to buy premium articles and manage your subscription.",
};

const storeButtonClass =
  "apps-store-link flex min-h-[52px] w-full max-w-[min(100%,22rem)] items-center justify-center rounded-xl border-2 border-blue-900/25 px-7 py-3.5 font-sans text-base font-semibold shadow-md no-underline transition-[background-color,box-shadow,transform] hover:shadow-lg active:scale-[0.99]";

export default function AppsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-lg font-semibold text-accent no-underline transition-opacity hover:opacity-90"
          >
            Publish Desk
          </Link>
          <Link href="/" className="text-sm font-medium text-muted no-underline hover:text-foreground">
            ← Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-8 py-16 text-center sm:px-10 md:py-20">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Get the Publish Desk app
        </h1>
        <p className="mt-4 font-sans text-base leading-relaxed text-muted">
          Premium articles and purchases are available in our mobile apps. Use the same account you use on the web.
        </p>
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-6 px-2 sm:px-0">
          <a
            href={IOS_APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${storeButtonClass} bg-[#2563eb] hover:bg-[#1d4ed8]`}
          >
            Download for iOS (App Store)
          </a>
          <a
            href={ANDROID_PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${storeButtonClass} bg-[#1d4ed8] hover:bg-[#1e40af]`}
          >
            Download for Android (Google Play)
          </a>
        </div>
      </main>
    </div>
  );
}
