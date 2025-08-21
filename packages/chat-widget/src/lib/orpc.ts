import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { appRouter } from "@solved-contact/auth-server/routers";

/**
 * Create ORPC client for chat widget
 * Similar to the web app's ORPC setup but configurable for different base URLs
 */
export function createChatORPCClient(apiBaseUrl = "") {
  const link = new RPCLink({
    url: `${apiBaseUrl}/rpc`,
    fetch(url, options) {
      return fetch(url, {
        ...options,
        // Include credentials for session management
        credentials: "include",
      });
    },
  });

  const client: RouterClient<typeof appRouter> = createORPCClient(link);
  const orpc = createTanstackQueryUtils(client);

  return { client, orpc, link };
}

/**
 * Default ORPC client instance
 * This can be used when apiBaseUrl is known at build time
 */
export const { client: defaultClient, orpc: defaultOrpc } = createChatORPCClient();

/**
 * Type-safe chat router client
 * Provides access to chat-specific endpoints with full type safety
 */
export type ChatRouterClient = RouterClient<typeof appRouter>["chat"];