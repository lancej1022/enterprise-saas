import { must } from "@/shared/must";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  createAuthMiddleware,
  jwt,
  openAPI,
  organization,
} from "better-auth/plugins";
import cookie from "cookie";

import { db } from "../db";
import * as schema from "../db/schema/auth";
import { ac, admin, member, owner } from "./permissions";

const corsOrigins = process.env.CORS_ORIGIN?.split(",") || [];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
    usePlural: true,
  }),

  // databaseHooks: {
  //   session: {
  //     create: {
  //       before: async (session) => {
  //         // TODO: have to decide how to retrieve the active organization of the user
  //         const organization = await getActiveOrganization(session.userId);
  //         return {
  //           data: {
  //             ...session,
  //             activeOrganizationId: organization.id,
  //           },
  //         };
  //       },
  //     },
  //   },
  // },
  trustedOrigins: [...corsOrigins, "my-better-t-app://"],
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    expo(),
    jwt({
      jwt: {
        // This is now long your websockets will be able to stay up. When the
        // websocket is closed, all the queries are dematerialized on the
        // server. So making the socket lifetime too short is bad for
        // performance.
        //
        // The Zero team is working on some improvements to auth that will
        // enable shorter-lived tokens.
        expirationTime: "1h",
      },
    }),
    openAPI(),
    organization({
      ac,
      teams: {
        enabled: true,
        // TODO: limit teams per organization based on enterprise plans
        // maximumTeams: async ({ organizationId, session }, request) => {
        //   // Dynamic limit based on organization plan
        //   const plan = await getPlan(organizationId)
        //   return plan === 'pro' ? 20 : 5
        // },
        // allowRemovingAllTeams: false, // Optional: prevent removing the last team
      },
      // TODO: limit members per organization based on enterprise plans
      // membershipLimit: () => {}
      roles: {
        owner,
        admin,
        member,
        // myCustomRole,
      },
    }),
  ],
  hooks: {
    // We set the JWT, email, and userid in cookies to avoid needing an extra
    // round-trip to get them on startup.
    after: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path.includes("/sign-in/email") ||
        ctx.path.includes("/sign-up/email")
      ) {
        const headers = must(ctx.context.responseHeaders);

        const setCookieHeader = ctx.context.responseHeaders?.get("set-cookie");
        const cookieVal = setCookieHeader?.split(";")[0];

        const session = await auth.api.getSession({
          headers: new Headers({
            cookie: cookieVal ?? "",
          }),
        });

        const token = await auth.api.getToken({
          headers: new Headers({
            cookie: cookieVal ?? "",
          }),
        });

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- taken from ztunes
        if (session && token) {
          setCookies(headers, {
            userid: session.user.id,
            email: session.user.email,
            jwt: token.token,
          });
        }
        return;
      }

      if (ctx.path.includes("/sign-out")) {
        const headers = must(ctx.context.responseHeaders);
        setCookies(headers, {
          userid: "",
          email: "",
          jwt: "",
        });
        return;
      }
    }),
  },
});

export function setCookies(
  headers: Headers,
  cookies: { email: string; jwt: string; userid: string },
) {
  const opts = {
    // 1 year. Note that it doesn't really matter what this is as the JWT has
    // its own, much shorter expiry above. It makes sense for it to be long
    // since by default better auth will extend its own session indefinitely
    // as long as you keep calling getSession().
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };
  for (const [key, value] of Object.entries(cookies)) {
    headers.append("Set-Cookie", cookie.serialize(key, value, opts));
  }
}
