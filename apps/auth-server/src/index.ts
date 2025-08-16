import "dotenv/config";

import { serve } from "@hono/node-server";
import { RPCHandler } from "@orpc/server/fetch";
import {
  PostgresJSConnection,
  PushProcessor,
  ZQLDatabase,
} from "@rocicorp/zero/pg";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as jose from "jose";
import postgres from "postgres";

import { auth } from "./lib/auth";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { createMutators } from "./zero/mutators";
import { schema } from "./zero/schema";

const app = new Hono();

const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
  throw new Error("CORS_ORIGIN is not set");
}

const pgURL = process.env.PG_URL;
if (!pgURL) {
  throw new Error("PG_URL is not set");
}

const processor = new PushProcessor(
  new ZQLDatabase(new PostgresJSConnection(postgres(pgURL)), schema),
);

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

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// Zero push endpoint
app.post("/api/zero/push", async (c) => {
  // eslint-disable-next-line no-console -- TODO: debugging
  console.log("Zero push request received");
  const userAuth = await getUserAuth(c.req.raw);
  if (
    typeof userAuth === "object" &&
    userAuth !== null &&
    "error" in userAuth
  ) {
    return c.json(userAuth, { status: 401 });
  }

  try {
    const result = await processor.process(
      createMutators(userAuth ?? undefined),
      c.req.raw,
    );
    return c.json(result);
  } catch (err) {
    console.error("Zero push error:", err);
    return c.json({ error: "Invalid token" }, { status: 401 });
  }
});

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

app.get("/", (c) => {
  return c.text("OK");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    // eslint-disable-next-line no-console -- intentionally signaling that the server is running
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

async function getUserAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const prefix = "Bearer ";
  if (!authHeader.startsWith(prefix)) {
    return {
      error: "Missing or invalid authorization header",
    };
  }

  const token = authHeader.slice(prefix.length);
  const set = await auth.api.getJwks();
  const jwks = jose.createLocalJWKSet(set);

  try {
    const { payload } = await jose.jwtVerify(token, jwks);
    const sub = payload.sub;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: fix this
    const activeOrganizationId = payload.activeOrganizationId as
      | string
      | undefined;

    if (!sub || !activeOrganizationId) {
      return {
        error: "Invalid token payload",
      };
    }

    return {
      sub: sub,
      activeOrganizationId: activeOrganizationId,
    };
  } catch (err) {
    // eslint-disable-next-line no-console -- TODO: debugging
    console.info(
      "Could not verify token: " +
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: fix this
        ((err as Error | undefined)?.message ?? String(err)),
    );
    return {
      error: "Invalid token",
    };
  }
}
