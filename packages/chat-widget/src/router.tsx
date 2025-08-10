import {
  createMemoryHistory,
  createRouter as createTanstackRouter,
} from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";

import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";

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
