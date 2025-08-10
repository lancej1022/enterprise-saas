import * as Sentry from "@sentry/tanstackstart-react";
import {
  createMiddleware,
  registerGlobalMiddleware,
} from "@tanstack/react-start";

registerGlobalMiddleware({
  middleware: [
    //  @ts-expect-error - boilerplate from create-tsrouter CLI, no idea if this actually works lol
    createMiddleware().server(Sentry.sentryGlobalServerMiddlewareHandler()),
  ],
});
