import { createFileRoute } from "@tanstack/react-router";

import { ChatDisplay } from "./-components/chat-display";

export const Route = createFileRoute("/_authenticated/inbox/$conversation-id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { "conversation-id": conversationId } = Route.useParams();
  return <ChatDisplay conversationId={conversationId} />;
}
