import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { ChatWidget } from "#/components/chat-widget";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChatWidget
      isOpen={isOpen}
      onToggle={() => {
        setIsOpen(!isOpen);
      }}
    />
  );
}
