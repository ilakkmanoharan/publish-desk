import { DashboardShell } from "./dashboard-shell";
import { DashboardGuard } from "./dashboard-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardGuard>
      <div className="min-h-screen bg-background">
        <DashboardShell>{children}</DashboardShell>
      </div>
    </DashboardGuard>
  );
}
