import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { chatRouter } from "./chat";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- TODO: came with the better-t-stack template, but might not be correct
      user: context.session?.user,
    };
  }),
  chat: chatRouter,
};
