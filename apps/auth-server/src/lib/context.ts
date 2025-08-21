import type { Context as HonoContext } from "hono";

import { auth } from "./auth";

export interface CreateContextOptions {
  context: HonoContext;
}

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  return {
    session,
    request: context.req.raw,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
