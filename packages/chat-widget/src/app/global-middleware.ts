import * as Sentry from "@sentry/tanstackstart-react";
import {
  createMiddleware,
  registerGlobalMiddleware,
} from "@tanstack/react-start";

registerGlobalMiddleware({
  middleware: [
    // @ts-expect-error -- TODO: fix this
    createMiddleware().server(Sentry.sentryGlobalServerMiddlewareHandler()),
  ],
});
