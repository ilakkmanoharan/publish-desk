"use client";

import { DashboardNav } from "./dashboard-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <DashboardNav />
      <main className="min-h-screen flex-1 min-w-0 bg-[#F3F4F6] pl-[15rem] pr-6 pt-8 pb-12 md:pr-10">
        {children}
      </main>
    </div>
  );
}
