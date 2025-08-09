import { type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { CookiesProvider } from "react-cookie";
import { must } from "shared/must";

import { DefaultCatchBoundary } from "#/components/catch-boundary";
import { type RouterContext } from "#/router";
import { SessionInit } from "#/routes/-components/session-init";
import { ZeroInit } from "#/routes/-components/zero-init";

export const Route = createRootRouteWithContext<RouterContext>()({
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Solved Contact",
      },
    ],
    // scripts: [
    //   {
    //     src: "//unpkg.com/react-scan/dist/auto.global.js",
    //     crossOrigin: "anonymous",
    //   },
    // ],
  }),
  notFoundComponent: () => <div>Not Found</div>,
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = useRouter().options.context;
  return (
    <RootDocument>
      <CookiesProvider>
        <SessionInit>
          <ZeroInit>
            <QueryClientProvider client={queryClient}>
              <Outlet />
            </QueryClientProvider>
          </ZeroInit>
        </SessionInit>
      </CookiesProvider>
    </RootDocument>
  );
}

if (typeof import.meta.env === "undefined") {
  // @ts-expect-error -- this is a hack to make sure `import.meta.env` doesnt crash playwright
  import.meta.env = {};
}

const serverURL = must(
  // TODO: the only reason we need the `process.env` fallback is because playwright somehow trips over `import.meta.env`
  import.meta.env.VITE_PUBLIC_SERVER || process.env.VITE_PUBLIC_SERVER,
  "VITE_PUBLIC_SERVER is required",
);

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // TODO: language should be dynamic based on the user's preferences
    <html lang="en-US">
      <head>
        <link href={serverURL} rel="preconnect" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          html {
            font-family: sans-serif;
            font-optical-sizing: auto;
            font-weight: 400;
            font-style: normal;
          }
        `,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {/* TODO: Because this logic is purely client-side, it causes a hydration mismatch. Need to switch to a cookie/SSR solution to avoid that without
        relying on `suppressHydrationWarning`. */}
        <ScriptOnce>
          {`
            const theme = localStorage.theme;
            const root = window.document.documentElement;

            if (theme === "system") {
              const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";

              root.classList.add(systemTheme);
              console.log("system theme: ", systemTheme);
            } else {
              root.classList.add(theme);
            }
            `}
        </ScriptOnce>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
