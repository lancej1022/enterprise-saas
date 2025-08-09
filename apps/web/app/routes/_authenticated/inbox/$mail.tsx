import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/inbox/$mail")({
  component: RouteComponent,
});

function RouteComponent() {
  const { mail } = Route.useParams();
  return <div>Hello "/_authenticated/inbox/" {mail}!</div>;
}
