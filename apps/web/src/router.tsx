import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";

import { DefaultCatchBoundary } from "./components/catch-boundary";
import { ThemeProvider } from "./components/theme/theme-provider";
import { routeTree } from "./routeTree.gen";

// import { NotFound } from './components/NotFound'

// NOTE: Most of the integration code found here is experimental and will
// definitely end up in a more streamlined API in the future. This is just
// to show what's possible with the current APIs.

export function createRouter() {
  const queryClient = new QueryClient();

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { queryClient, auth: undefined },
      defaultPreload: "intent",
      defaultErrorComponent: DefaultCatchBoundary,
      // defaultNotFoundComponent: () => <NotFound />,
      defaultNotFoundComponent: () => <div>Not found</div>,

      // Since we're using React Query, we don't want loader calls to ever be stale
      // This will ensure that the loader is always called when the route is preloaded or visited
      // It is fine to call Zero multiple times for same query, Zero dedupes the
      // queries internally.
      defaultPreloadStaleTime: 0,
      // We don't want TanStack skipping any calls to us. We want to be asked to
      // preload every link. This is fine because Zero has its own internal
      // deduping and caching.
      defaultPreloadGcTime: 0,

      scrollRestoration: true,
      Wrap: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryClientProvider>
      ),
    }),
    queryClient,
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
