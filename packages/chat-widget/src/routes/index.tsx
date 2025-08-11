import { createFileRoute } from "@tanstack/react-router";

import { ChatWidget } from "#/components/chat-widget";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return <ChatWidget />;
}
