import { useEffect } from "react";
import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { type AuthContext } from "~/auth";
import { ThemeProvider } from "~/components/theme/theme-provider";

export const Route = createRootRouteWithContext<{
  auth: AuthContext | undefined;
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">Start Over</Link>
      </div>
    );
  },
  head: () => ({
    // TODO: this is just placeholder stuff and we need something more official as the app matures
    meta: [
      {
        name: "description",
        content: "My App is a web application",
      },
      {
        title: "My App",
      },
    ],
  }),
});

function RootComponent() {
  // Wasnt sure how to explicitly pass styles to the tanstack router devtools button, so this is a hack to add a margin to the button
  useEffect(() => {
    setTimeout(() => {
      const devtoolsButton = document.querySelector(
        'button[aria-label="Open TanStack Router Devtools"]',
      );
      if (devtoolsButton) {
        devtoolsButton.classList.add("mr-[60px]");
      }
    }, 200); // wait for the render to complete
  }, []);

  return (
    <>
      <HeadContent />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
        <ReactQueryDevtools buttonPosition="bottom-right" />
        <TanStackRouterDevtools position="bottom-right" />
      </ThemeProvider>
    </>
  );
}
