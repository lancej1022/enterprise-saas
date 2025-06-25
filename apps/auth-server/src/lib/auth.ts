import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, organization } from "better-auth/plugins";

import { db } from "../db";
import * as schema from "../db/schema/auth";
import { ac, admin, member, owner } from "./permissions";

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
  trustedOrigins: [
    ...(process.env.CORS_ORIGIN?.split(",") || []),
    "my-better-t-app://",
  ],
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    expo(),
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
});
