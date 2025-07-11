// import { TRPCError } from '@trpc/server'
import { type TRPCRouterRecord } from "@trpc/server";

// import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from "./init";

const peopleRouter = {
  // eslint-disable-next-line @typescript-eslint/require-await -- tanstack start boilerplate...
  list: publicProcedure.query(async () => [
    {
      name: "John Doe",
    },
    {
      name: "Jane Doe",
    },
  ]),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
  people: peopleRouter,
});
export type TRPCRouter = typeof trpcRouter;
