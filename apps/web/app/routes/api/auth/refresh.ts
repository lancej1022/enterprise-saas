import { createServerFileRoute } from "@tanstack/react-start/server";
import { auth, setCookies } from "@solved-contact/auth-server/auth";

export const ServerRoute = createServerFileRoute("/api/auth/refresh").methods({
  GET: async ({ request }) => {
    // eslint-disable-next-line no-console -- TODO: debugging
    console.log("ServerRoute GET request: ", request);
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) {
      // eslint-disable-next-line no-console -- taken from ztunes
      console.info("Could not get session");
      return unauthorized();
    }

    const token = await getJwtToken(request.headers);
    if (!token) {
      // eslint-disable-next-line no-console -- taken from ztunes
      console.info("Could not get JWT token");
      return unauthorized();
    }

    // eslint-disable-next-line no-console -- taken from ztunes
    console.info("Refreshed JWT token");
    return authorized(session.user.id, session.user.email, token);
  },
});

async function getJwtToken(headers: Headers) {
  const result = await fetch("/api/auth/token", {
    headers,
  });
  if (!result.ok) {
    console.error("Could not refresh JWT token", await result.text());
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- taken from ztunes
  const body = await result.json();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access -- taken from ztunes
  return body.token as string;
}

function unauthorized() {
  return createResponse(401, "", "", "");
}

function authorized(userid: string, email: string, jwt: string) {
  return createResponse(200, userid, email, jwt);
}

// eslint-disable-next-line max-params -- taken from ztunes
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
  return new Response(null, {
    status,
    headers,
  });
}
