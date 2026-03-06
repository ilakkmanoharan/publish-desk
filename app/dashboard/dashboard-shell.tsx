"use client";

import { DashboardNav } from "./dashboard-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardNav />
      <main className="ml-56 p-8">{children}</main>
    </>
  );
}
