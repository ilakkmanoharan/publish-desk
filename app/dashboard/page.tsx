"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

const linkCardClass =
  "group rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-colors hover:border-[#D1D5DB] hover:shadow-md";

const stepShell =
  "rounded-xl border border-[#EEF2F6] bg-[#FAFBFC] px-4 py-4 sm:px-5 sm:py-5";

export default function DashboardHomePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">Dashboard</h1>
      <p className="mt-2 font-sans text-sm leading-relaxed text-[#64748B]">
        New to Publish Desk? Follow these steps to start publishing.
      </p>

      <section
        className="mt-8 rounded-2xl border border-[#E5E7EB] border-l-4 border-l-accent bg-gradient-to-br from-[#FFFBF5] to-white p-6 shadow-md sm:p-8"
        aria-labelledby="get-started-heading"
        data-testid="dashboard-getting-started"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1F5F9] pb-5">
          <div className="min-w-0">
            <h2 id="get-started-heading" className="font-display text-2xl font-bold tracking-tight text-[#111827]">
              Get started
            </h2>
          </div>
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#E2E8F0] bg-[#F8FAFC] font-sans text-[10px] font-semibold leading-tight text-[#64748B] text-center"
            aria-hidden
          >
            3 steps
          </div>
        </div>

        <ol className="mt-6 list-none space-y-3 p-0">
          <li className={stepShell}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <p className="font-sans text-xs font-bold uppercase tracking-wide text-[#6366F1]">Step 1</p>
                <p className="mt-1 font-sans text-sm font-semibold text-[#0F172A]">Write content in Markdown</p>
                <div className="mt-2 space-y-2 font-sans text-sm leading-relaxed text-[#64748B]">
                  <p>
                    Create your articles as{" "}
                    <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[12px] text-[#334155]">.md</code>{" "}
                    files.
                  </p>
                  <p>
                    Use the{" "}
                    <Link
                      href="/dashboard/article-template"
                      className="font-medium text-accent no-underline hover:underline"
                    >
                      article template
                    </Link>{" "}
                    to add title, tags, categories, and publish settings.
                  </p>
                  <p>
                    Sync your content from GitHub in{" "}
                    <Link href="/dashboard/source" className="font-medium text-accent no-underline hover:underline">
                      Content Source
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </li>

          <li className={stepShell}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-sans text-xs font-bold uppercase tracking-wide text-[#6366F1]">Step 2</p>
                <p className="mt-1 font-sans text-sm font-semibold text-[#0F172A]">Create magazines</p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[#64748B]">
                  Magazines are themed publications that group and present your articles together.
                </p>
              </div>
              <Link
                href="/dashboard/magazines"
                className="dashboard-primary-cta inline-flex shrink-0 items-center justify-center rounded-lg bg-[#4F46E5] px-4 py-2.5 font-sans text-sm font-semibold shadow-sm transition-opacity hover:opacity-95"
              >
                View magazines
              </Link>
            </div>
          </li>

          <li className={stepShell}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-xs font-bold uppercase tracking-wide text-[#6366F1]">Step 3</p>
                <p className="mt-1 font-sans text-sm font-semibold text-[#0F172A]">Manage your content</p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[#64748B]">
                  Use the{" "}
                  <Link href="/dashboard/content" className="font-medium text-accent no-underline hover:underline">
                    content library
                  </Link>{" "}
                  to organize articles, assign them to magazines, and choose when to publish. Control access with free or
                  premium settings.
                </p>
              </div>
              <Link
                href="/dashboard/content"
                className="inline-flex shrink-0 items-center justify-center self-start rounded-lg border border-[#CBD5E1] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#0F172A] no-underline shadow-sm transition-colors hover:bg-[#F8FAFC] sm:self-center"
              >
                Manage content
              </Link>
            </div>
          </li>
        </ol>
      </section>

      <h2 className="mt-10 font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#64748B]">Workspaces</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        <li>
          <Link href="/dashboard/content" className={`${linkCardClass} block no-underline`}>
            <span className="font-sans text-base font-semibold text-accent group-hover:underline">Content library</span>
            <p className="mt-2 font-sans text-sm leading-relaxed text-[#64748B]">
              All drafts and synced articles, categories, and tags.
            </p>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/magazines" className={`${linkCardClass} block no-underline`}>
            <span className="font-sans text-base font-semibold text-[#111827] group-hover:text-accent">Magazines</span>
            <p className="mt-2 font-sans text-sm leading-relaxed text-[#64748B]">Curate issues and publication order.</p>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/profile" className={`${linkCardClass} block no-underline`}>
            <span className="font-sans text-base font-semibold text-[#111827] group-hover:text-accent">Profile</span>
            <p className="mt-2 font-sans text-sm leading-relaxed text-[#64748B]">Public hub, schedule, and source.</p>
          </Link>
        </li>
        <li>
          <Link href="/dashboard/source" className={`${linkCardClass} block no-underline`}>
            <span className="font-sans text-base font-semibold text-[#111827] group-hover:text-accent">Content source</span>
            <p className="mt-2 font-sans text-sm leading-relaxed text-[#64748B]">GitHub sync and repo settings.</p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
