"use client";

import { DashboardNav } from "./dashboard-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <DashboardNav />
      <main className="min-h-0 min-w-0 flex-1 px-6 pb-12 pt-8 md:px-10">
        {children}
      </main>
    </div>
  );
}
