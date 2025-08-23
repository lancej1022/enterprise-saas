import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { appRouter } from "@solved-contact/auth-server/routers";

if (typeof import.meta.env === "undefined") {
  // @ts-expect-error -- this is a hack to make sure `import.meta.env` doesnt crash playwright
  import.meta.env = {};
}

// TODO: the only reason we need the `process.env` fallback is because playwright somehow trips over `import.meta.env`
const link = new RPCLink({
  url: `${import.meta.env.VITE_SERVER_URL || process.env.VITE_SERVER_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const client: RouterClient<typeof appRouter> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
