import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/admin/teams/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h1>Hello "/(authenticated)/admin/teams/"!</h1>
    </div>
  );
}
