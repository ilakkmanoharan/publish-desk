"use client";

import { usePathname } from "next/navigation";
import { DashboardNav } from "./dashboard-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/dashboard/login";

  return (
    <>
      <DashboardNav />
      <main className={isLogin ? "p-0" : "ml-56 p-8"}>{children}</main>
    </>
  );
}
