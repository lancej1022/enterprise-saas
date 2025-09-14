import {
  PostgresJSConnection,
  PushProcessor,
  ZQLDatabase,
} from "@rocicorp/zero/pg";
import { handleGetQueriesRequest } from "@rocicorp/zero/server";
import { Hono } from "hono";
import * as jose from "jose";
import postgres from "postgres";
import { must } from "@solved-contact/utilities/must";

import { getQuery } from "#/zero/get-queries";
import { auth, setCookies } from "../lib/auth";
import { createMutators } from "../zero/mutators";
import { schema } from "../zero/schema";

// Validate required environment variables
const pgURL = must(process.env.PG_URL, "PG_URL is not set");

// Initialize Zero infrastructure
const processor = new PushProcessor(
  new ZQLDatabase(new PostgresJSConnection(postgres(pgURL)), schema),
);

const app = new Hono();

// Helper function to create response with auth cookies
// eslint-disable-next-line max-params -- TODO: fix this
function createResponse(
  status: number,
  userid: string,
  email: string,
  jwt: string,
) {
  const headers = new Headers();
  setCookies(headers, {
    userid,
    email,
    jwt,
  });
  // TODO: does this work with Hono...?
  return new Response(null, {
    status,
    headers,
  });
}

// Helper function to get user authentication from request
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
      sub: must(sub, "Empty sub in token"),
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

// Zero refresh endpoint
app.get("/refresh", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) {
    // eslint-disable-next-line no-console -- taken from ztunes
    console.info("Could not get session");
    return createResponse(401, "", "", "");
  }

  // TODO: pretty sure causes this endpoint to call the auth server again :| not good
  const token = await auth.api.getToken({
    headers: c.req.raw.headers,
  });
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- TODO
  if (!token) {
    // eslint-disable-next-line no-console -- taken from ztunes
    console.info("Could not get JWT token");
    return createResponse(401, "", "", "");
  }

  // eslint-disable-next-line no-console -- taken from ztunes
  console.info("Refreshed JWT token");
  return createResponse(200, session.user.id, session.user.email, token.token);
});

// Zero push endpoint
app.post("/push", async (c) => {
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

app.post("/get-queries", async (c) => {
  const userAuth = await getUserAuth(c.req.raw);
  if (
    typeof userAuth === "object" &&
    userAuth !== null &&
    "error" in userAuth
  ) {
    return c.json(userAuth, { status: 401 });
  }

  const userID = userAuth?.sub;
  const activeOrganizationId = userAuth?.activeOrganizationId;
  if (!userID || !activeOrganizationId) {
    return c.json({ error: "Invalid token" }, { status: 401 });
  }

  const result = await handleGetQueriesRequest(
    (name, args) =>
      // TODO: is there a way to rework the `userAuth` object to be more consistent with the `ClientContext` type, so that we can pass the object directly
      // rather than creating a new object here? Would probably help reduce object allocations on the backend
      getQuery({ userID, activeOrganizationId }, name, args),
    schema,
    c.req.raw,
  );
  return c.json(result);
});

export default app;
