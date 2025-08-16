import { type Zero } from "@rocicorp/zero";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { type Mutators } from "@solved-contact/auth-server/zero/mutators";
import { type Schema } from "@solved-contact/auth-server/zero/schema";

import { type SessionContextType } from "./routes/-components/session-init";
import { routeTree } from "./routeTree.gen";
import { orpc } from "./utils/orpc";

import "./index.css";

export interface RouterContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
  session: SessionContextType;
  zero: Zero<Schema, Mutators>;
}

export function createRouter() {
  // queryClient needs to be created here rather than globally, otherwise different users can accidentally share the same query cache!
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error(`Error: ${error.message}`, {
          action: {
            label: "retry",
            onClick: () => {
              void queryClient.invalidateQueries();
            },
          },
        });
      },
    }),
  });

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    // TODO: Consider changing to `intent` with a delay of `1ms` just to slightly reduce the Zero cache activity? Might not matter though, since the DB is local
    defaultPreload: "viewport",
    // It is fine to call Zero multiple times for same query, Zero dedupes the
    // queries internally.
    defaultPreloadStaleTime: 0,
    // We don't want TanStack skipping any calls to us. We want to be asked to
    // preload every link. This is fine because Zero has its own internal
    // deduping and caching.
    defaultPreloadGcTime: 0,
    context: {
      orpc,
      queryClient,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- taken from ztunes
      zero: undefined as unknown as Zero<Schema, Mutators>, // populated in ZeroInit,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- taken from ztunes
      session: undefined as unknown as SessionContextType, // populated in SessionProvider
    } satisfies RouterContext,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
