import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/admin/teams/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(authenticated)/admin/teams/"!</div>;
}
