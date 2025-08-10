import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import logo from "../logo.svg";
import { ChatWidget } from "./-components/chat-widget";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="text-center">
      <header className="flex min-h-screen flex-col items-center justify-center bg-[#282c34] text-[calc(10px+2vmin)] text-white">
        <img
          alt="logo"
          className="pointer-events-none h-[40vmin] animate-[spin_20s_linear_infinite]"
          src={logo}
        />
        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <ChatWidget isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      </header>
    </div>
  );
}
