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
import { eq } from "drizzle-orm";

import { must } from "#/shared/must";
import { db } from "../db";
import * as schema from "../db/schema/auth";
import { ac, admin, member, owner } from "./permissions";

const corsOrigins = process.env.CORS_ORIGIN?.split(",") || [];
const secret = process.env.BETTER_AUTH_SECRET;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
    usePlural: true,
  }),

  databaseHooks: {
    user: {
      create: {
        after: async (user, _ctx) => {
          // TODO: check if org name is already taken OR just create a randomized name
          await auth.api.createOrganization({
            body: {
              name: `${user.name} organization`,
              slug: `${user.name}-organization`,
              userId: user.id,
            },
          });
        },
        // TODO: Check if the org name is already taken and throw (or something) if so? OR just create a randomized org in the `after` hook? eg companyName-uuidHere
        // before: async (user, ctx) => {
        //   // Modify the user object before it is created
        //   return Promise.resolve(true);
        //   // return {
        //   //   data: {
        //   //     ...user,
        //   //     firstName: user.name.split(" ")[0],
        //   //     lastName: user.name.split(" ")[1],
        //   //   },
        //   // };
        // },
      },
    },
    session: {
      create: {
        before: async (session) => {
          // Get the user's first organization as the active organization
          const organization = await getActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id || null,
            },
          };
        },
      },
    },
  },
  trustedOrigins: [...corsOrigins, "my-better-t-app://"],
  emailAndPassword: {
    enabled: true,
  },
  secret: secret,
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    expo(),
    jwt({
      jwt: {
        definePayload: (ctx) => {
          return {
            ...ctx.user,
            // add the orgId so that Zero Cache Server can access it through the JWT
            /* 
              eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: how do we make better-auth aware that `activeOrganizationId` 
              is guaranteed to be set thanks to the `databaseHooks` above?
            */
            activeOrganizationId: ctx.session.activeOrganizationId,
          };
        },
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
      // beforeCreate: async ({ organization, user }, request) => {
      //   // Run custom logic before organization is created
      //   // Optionally modify the organization data
      //   return {
      //     data: {
      //       ...organization,
      //       metadata: {
      //         customField: "value",
      //       },
      //     },
      //   };
      // },
      // // @ts-expect-error -- debugging
      // afterCreate: ({ organization, member, user }, request) => {
      //   console.log("organization created", organization);
      //   console.log("member created", member);
      //   console.log("user created", user);
      //   // Run custom logic after organization is created
      //   // e.g., create default resources, send notifications
      //   // await setupDefaultResources(organization.id);
      // },
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

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- from ztunes
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

// TODO: expand this logic so it doesnt just always return the first org.
// Probably need to persist the user's most recent org or something somehow?
async function getActiveOrganization(userId: string) {
  // Get the user's first organization by joining members and organizations tables
  const userOrganizations = await db
    .select({
      id: schema.organizations.id,
      name: schema.organizations.name,
    })
    .from(schema.members)
    .innerJoin(
      schema.organizations,
      eq(schema.members.organizationId, schema.organizations.id),
    )
    .where(eq(schema.members.userId, userId))
    .limit(1);

  // Return the first organization or null if user has no organizations
  return userOrganizations[0] || null;
}
