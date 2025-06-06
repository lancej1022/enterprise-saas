// import Header from "@/components/header";
// import Loader from "@/components/loader";
// import { ThemeProvider } from "@/components/theme-provider";
// import { Toaster } from "@/components/ui/sonner";
// import { link, orpc, ORPCContext } from "@/utils/orpc";
// import type { RouterClient } from "@orpc/server";
import type { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
// import type { appRouter } from "../../../server/src/routers";
// import { createORPCClient } from "@orpc/client";
// import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import "../index.css";

export interface RouterAppContext {
  // orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  // context: {
  //   queryClient,
  // },
  head: () => ({
    meta: [
      {
        title: "My App",
      },
      {
        name: "description",
        content: "My App is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });

  // const [client] = useState<RouterClient<typeof appRouter>>(() => createORPCClient(link));
  // const [orpcUtils] = useState(() => createTanstackQueryUtils(client));

  return (
    <>
      <HeadContent />
      {/* <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme"> */}
      <div className="grid h-svh grid-rows-[auto_1fr]">
        {/* <Header /> */}
        {isFetching ? <div>Loading...</div> : <Outlet />}
      </div>
      {/* <Toaster richColors /> */}
      {/* </ThemeProvider> */}
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
