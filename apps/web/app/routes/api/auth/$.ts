import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth } from "@solved-contact/auth-server/auth";

// TODO: in theory, we shouldnt even be hitting these right? Should just hit the hono auth server?
export const ServerRoute = createServerFileRoute("/api/auth/$").methods({
  GET: ({ request }) => {
    // eslint-disable-next-line no-console -- TODO: debugging
    console.log("GET request");
    return auth.handler(request);
  },
  POST: ({ request }) => {
    // eslint-disable-next-line no-console -- TODO: debugging
    console.log("POST request");
    return auth.handler(request);
  },
});
