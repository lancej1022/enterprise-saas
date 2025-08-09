import { createFileRoute } from "@tanstack/react-router";

import { mails } from "./-components/data";
import { MailDisplay } from "./-components/mail-display";

export const Route = createFileRoute("/_authenticated/inbox/$mail")({
  component: RouteComponent,
});

function RouteComponent() {
  const { mail } = Route.useParams();
  return <MailDisplay mail={mails.find((item) => item.id === mail) || null} />;
}
