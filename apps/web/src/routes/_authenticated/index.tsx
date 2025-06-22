import { createFileRoute } from "@tanstack/react-router";

// This creates a route that matches `/` after being authenticated
export const Route = createFileRoute("/_authenticated/")({
  component: Page,
});

function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1>Home</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}
