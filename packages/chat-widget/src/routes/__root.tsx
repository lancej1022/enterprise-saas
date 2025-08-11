import { type QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import TanStackQueryLayout from "../integrations/tanstack-query/layout";

export interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
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
      <HeadContent />
      {children}
      <TanStackRouterDevtools />
      <TanStackQueryLayout />
      <Scripts />
    </div>
    //   </body>
    // </html>
  );
}
