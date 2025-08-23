import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { appRouter } from "@solved-contact/auth-server/routers";

const apiBaseUrl = import.meta.env.VITE_SERVER_URL;

const link = new RPCLink({
  url: `${apiBaseUrl}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,

      credentials: "include",
    });
  },
});

export const client: RouterClient<typeof appRouter> = createORPCClient(link);
/** @lintignore -- this will be used eventually */
export const orpc = createTanstackQueryUtils(client);
