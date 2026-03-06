"use client";

import { DashboardNav } from "./dashboard-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <DashboardNav />
      <main className="flex-1 min-w-0 pl-56 pr-8 pt-8 pb-8">{children}</main>
    </div>
  );
}
