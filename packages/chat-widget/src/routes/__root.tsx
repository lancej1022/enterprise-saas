import type { Zero } from "@rocicorp/zero";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { Mutators } from "@solved-contact/auth-server/zero/mutators";
import type { Schema } from "@solved-contact/auth-server/zero/schema";

import TanStackQueryLayout from "../integrations/tanstack-query/layout";

// Define router context interface similar to web app
export interface ChatWidgetRouterContext {
  queryClient: QueryClient;
  zero: Zero<Schema, Mutators>;
}

export const Route = createRootRouteWithContext<ChatWidgetRouterContext>()({
  // head: () => ({
  //   meta: [
  //     {
  //       charSet: "utf-8",
  //     },
  //     {
  //       name: "viewport",
  //       content: "width=device-width, initial-scale=1",
  //     },
  //     {
  //       title: "TanStack Start Starter",
  //     },
  //   ],
  //   links: [
  //     {
  //       rel: "stylesheet",
  //       href: appCss,
  //     },
  //   ],
  // }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // <html lang="en">
    //   <head>
    //   </head>
    //   <body>
    <div>
      {children}
      <TanStackRouterDevtools />
      <TanStackQueryLayout />
      <Scripts />
    </div>
    //   </body>
    // </html>
  );
}
