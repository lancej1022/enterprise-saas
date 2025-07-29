import {
  PostgresJSConnection,
  PushProcessor,
  ZQLDatabase,
} from "@rocicorp/zero/pg";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import * as jose from "jose";
import postgres from "postgres";
import { must } from "shared/must";
import { createMutators } from "zero/mutators";
import { schema } from "zero/schema";
import { auth } from "@solved-contact/auth-server/auth";

const pgURL = must(process.env.PG_URL, "PG_URL is required");

const processor = new PushProcessor(
  new ZQLDatabase(new PostgresJSConnection(postgres(pgURL)), schema),
);

export const ServerRoute = createServerFileRoute("/api/zero/push").methods({
  POST: async ({ request }) => {
    // eslint-disable-next-line no-console -- TODO: debugging
    console.log("ServerRoute POST request: ", request);
    const userID = await getUserID(request);
    if (typeof userID === "object") {
      return userID;
    }

    try {
      const result = await processor.process(
        // @ts-expect-error -- The eventual goal is to not have Tanstack as the push endpoint, but rather the Go server or Node auth-server
        // TODO: this does meant that this is a guaranteed bug below, since it's not passing the `activeOrganizationId`
        createMutators(userID ? { sub: userID } : undefined),
        request,
      );
      return json(result);
    } catch (err) {
      return json({ error: "Invalid token" }, { status: 401 });
    }
  },
});

async function getUserID(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return undefined;
  }

  const prefix = "Bearer ";
  if (!authHeader.startsWith(prefix)) {
    return json(
      { error: "Missing or invalid authorization header" },
      { status: 401 },
    );
  }

  const token = authHeader.slice(prefix.length);
  const set = await auth.api.getJwks();
  const jwks = jose.createLocalJWKSet(set);

  try {
    const { payload } = await jose.jwtVerify(token, jwks);
    return must(payload.sub, "Empty sub in token");
  } catch (err) {
    // @ts-expect-error -- taken from ztunes
    // eslint-disable-next-line no-console -- taken from ztunes
    console.info("Could not verify token: " + (err.message ?? String(err)));
    return json({ error: "Invalid token" }, { status: 401 });
  }
}
