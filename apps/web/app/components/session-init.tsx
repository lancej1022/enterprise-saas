import { useMemo } from "react";
import { RouterContextProvider, useRouter } from "@tanstack/react-router";
import { authClient } from "auth/client";
import { type User } from "better-auth";
import { Cookies, useCookies } from "react-cookie";

export interface SessionContextType {
  data:
    | {
        activeOrganizationId: string;
        email: string;
        user: undefined | User; // TODO: its a little convoluted, but the below `data` type needs to be cleaned up in order to guarantee `User` is truthy if `data` is
        userID: string;
      }
    | undefined;
  zeroAuth: () => Promise<string | undefined>;
}

export function SessionInit({ children }: { children: React.ReactNode }) {
  const [cookies] = useCookies(["userid", "email", "jwt"]);
  // TODO: does this cause a bunch of re-renders?
  const { data: sessionData } = authClient.useSession();
  const activeOrganizationId = sessionData?.session.activeOrganizationId;

  const data = useMemo(() => {
    if (!cookies.userid || !cookies.email) {
      return undefined;
    }
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- taken from ztunes
      userID: cookies.userid,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- taken from ztunes
      email: cookies.email,
      // TODO: is this safe since it comes from useSession, rather than the cookies? Or are we fine as long as `userId` + `email` are cookie based, while the rest isnt...?
      user: sessionData?.user,
      // TODO: this should realistically never be undefined thanks to the `databaseHooks` in `auth-server`, but I havent bothered to make the FE understand that
      activeOrganizationId: activeOrganizationId ?? "",
    };
  }, [cookies.userid, cookies.email, sessionData?.user, activeOrganizationId]);

  const session = useMemo(() => {
    return {
      data,
      zeroAuth,
    };
    // eslint-disable-next-line react-hooks/react-compiler -- taken from ztunes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- taken from ztunes
  }, [data, cookies.jwt]);

  const router = useRouter();

  return (
    <RouterContextProvider
      context={{ session }}
      /**
       * key is a hack - it shouldn't be needed, but for some reason on logout,
       * when the session is changed to undefined, the router doesn't re-render.
       *
       * TODO: this creates potential re-render flaws, especially if `data` changes unexpectedly. Consider refactoring this away from the original Ztunes implementation and closer to the "typical" tanstack router implementation.
       */
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- taken from ztunes
      key={data?.activeOrganizationId || data?.user || data?.userID}
      router={router}
    >
      {children}
    </RouterContextProvider>
  );
}

// TODO: Zero will call this function to get a new JWT if verification fails, so this needs to be fixed otherwise refresh tokens wont work
async function zeroAuth(error?: "invalid-token") {
  if (error) {
    // TODO: this will attempt to hit the Tanstack Start auth/refresh endpoint, when we ACTUALLY need to hit the hono auth server
    await fetch("/api/auth/refresh", {
      credentials: "include",
    });
  }
  return new Cookies().get<string | undefined>("jwt");
}
