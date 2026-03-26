/** Replace with your real App Store URL when the iOS app is live. */
const IOS_APP_STORE_URL = "https://apps.apple.com/app/publish-desk/id0000000000";

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#374151]">{children}</h2>
  );
}

function SectionRule() {
  return <div className="mt-3 h-px w-full bg-[#E5E7EB]" />;
}

export default function BillingPage() {
  return (
    <div className="mx-auto w-full max-w-[720px]">
      <header className="mb-8 sm:mb-10">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
          Billing and plans
        </h1>
        <p className="mt-2 font-sans text-sm leading-relaxed text-[#64748B]">
          Premium is sold only through the Publish Desk iOS app.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <section className="px-8 py-8 sm:px-10 sm:py-10 lg:px-12">
          <SectionTitle>Current subscriptions</SectionTitle>
          <SectionRule />
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <p className="font-sans text-sm leading-relaxed text-[#64748B]">
                <span className="font-semibold text-[#0F172A]">Premium</span> is our paid plan. After you subscribe
                in the app, your benefits apply across Publish Desk—including on the web when you use the same
                account.
              </p>
              <p className="font-sans text-sm leading-relaxed text-[#64748B]">
                You can&apos;t buy or renew Premium on this website. Sign in to the{" "}
                <strong className="font-semibold text-[#374151]">Publish Desk iOS app</strong> with this account
                to purchase or manage your subscription.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <a
                href={IOS_APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffffff" }}
                className="inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-lg bg-[#4F46E5] px-5 py-2.5 text-center font-sans text-sm font-semibold shadow-sm no-underline transition-opacity hover:opacity-95 hover:no-underline"
              >
                View in App Store
              </a>
              <p className="max-w-[220px] font-sans text-[10px] leading-snug text-[#94A3B8] sm:text-right">
                Placeholder link—replace the URL in code with your live App Store listing.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
