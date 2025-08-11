import {
  createMemoryHistory,
  createRouter as createTanstackRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import ReactDOM from "react-dom/client";

import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

import "./demo.index.css";

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
      context: { ...rqContext },
      defaultPreload: "intent",
      Wrap: (props: { children: React.ReactNode }) => {
        return (
          <TanstackQuery.Provider {...rqContext}>
            {props.children}
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

  // TODO: Claude made this originally, need to review which of these styles are truly needed and which might be missing
  widgetContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2147483647;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  // Append to body
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
