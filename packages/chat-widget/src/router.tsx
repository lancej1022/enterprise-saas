import type { Zero } from "@rocicorp/zero";
import {
  createMemoryHistory,
  createRouter as createTanstackRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import ReactDOM from "react-dom/client";
import type { Mutators } from "@solved-contact/auth-server/zero/mutators";
import type { Schema } from "@solved-contact/auth-server/zero/schema";

import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import { ZeroInit } from "./integrations/zero/zero-init";
import { routeTree } from "./routeTree.gen";
// import "./demo.index.css";
import "./styles.css";

import type { ChatWidgetRouterContext } from "./routes/__root";

// Used to ensure that changing the route within the chat-widget doesnt actually impact the browser URL
const memoryHistory = createMemoryHistory({
  initialEntries: ["/"],
});

export function createRouter() {
  const rqContext = TanstackQuery.getContext();

  return routerWithQueryClient(
    createTanstackRouter({
      routeTree,
      defaultSsr: false,
      history: memoryHistory,
      context: {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- following web app pattern
        zero: undefined as unknown as Zero<Schema, Mutators>, // populated in ZeroInit
        ...rqContext,
      } satisfies ChatWidgetRouterContext,
      defaultPreload: "intent",
      Wrap: (props: { children: React.ReactNode }) => {
        return (
          <TanstackQuery.Provider {...rqContext}>
            <ZeroInit>{props.children}</ZeroInit>
          </TanstackQuery.Provider>
        );
      },
    }),
    rqContext.queryClient,
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

// const rootElement = document.getElementById("app");

// if (rootElement && !rootElement.innerHTML) {
//   const root = ReactDOM.createRoot(rootElement);
//   root.render(<RouterProvider router={createRouter()} />);
// }

// Boot function that creates its own container and attaches to document.body
export function boot({
  app_id,
  email,
  created_at,
  name,
  user_id,
}: {
  app_id: string;
  created_at?: number;
  email: string;
  name: string;
  user_id: string;
}) {
  // Check if widget is already mounted to prevent duplicate instances
  const existingWidget = document.getElementById("chat-widget-root");
  if (existingWidget) {
    console.error("Chat widget is already mounted");
    return;
  }

  // Create a new container div
  const widgetContainer = document.createElement("div");
  widgetContainer.id = "chat-widget-root";

  // TODO: Need to work on the positioning of the widget
  widgetContainer.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 100px;
    z-index: 2147483647;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  document.body.appendChild(widgetContainer);

  // Create React root and render the widget
  const root = ReactDOM.createRoot(widgetContainer);
  root.render(<RouterProvider router={createRouter()} />);

  // Store user config for potential future use
  interface ChatWidgetWindow extends Window {
    __chatWidgetConfig?: {
      app_id: string;
      created_at?: number;
      email: string;
      name: string;
      user_id: string;
    };
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: claude
  (window as ChatWidgetWindow).__chatWidgetConfig = {
    app_id,
    email,
    created_at,
    name,
    user_id,
  };
}
