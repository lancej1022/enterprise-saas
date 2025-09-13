import "dotenv/config";

import { serve } from "@hono/node-server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { auth } from "./lib/auth";
import { createContext } from "./lib/context";
// import { startScheduledTasks } from "./lib/scheduled-tasks";
import { appRouter } from "./routers/index";
import zeroRouter from "./routers/zero";

const app = new Hono();

const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  throw new Error("CORS_ORIGIN is not set");
}

app.use(logger());
app.use(
  "/*",
  cors({
    origin: corsOrigin.split(","),
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.route("/api/zero", zeroRouter);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const handler = new RPCHandler(appRouter);
// @ts-expect-error - TODO: fix the "not all code paths return a value" error
app.use("/rpc/*", async (c, next) => {
  const context = await createContext({ context: c });
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }
  await next();
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    // eslint-disable-next-line no-console -- intentionally signaling that the server is running
    console.log(`Server is running on http://localhost:${info.port}`);

    // Start scheduled maintenance tasks
    // startScheduledTasks();
  },
);
