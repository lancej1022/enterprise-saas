import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { boot } from "@solved-contact/chat-widget";

import logo from "../logo.svg";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- TODO: fix the types of bundled package
    boot({
      app_id: "123",
      email: "test@test.com",
      created_at: 123,
      name: "Test User",
      user_id: "123",
    });
  }, []);
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
      </header>
    </div>
  );
}
