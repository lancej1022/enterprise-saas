import { createFileRoute } from "@tanstack/react-router";

import { AlertsPanel } from "#/components/marketing-idea/alerts-panel";
import { AnomalyFeed } from "#/components/marketing-idea/anomoly-feed";
import { DashboardHeader } from "#/components/marketing-idea/dashboard-header";
import { DashboardOverview } from "#/components/marketing-idea/dashboard-overview";
import { DashboardSidebar } from "#/components/marketing-idea/dashboard-sidebar";

export const Route = createFileRoute("/_authenticated/clients")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-background min-h-screen">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 space-y-6 p-6">
          <DashboardOverview />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnomalyFeed />
            </div>
            <div>
              <AlertsPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
