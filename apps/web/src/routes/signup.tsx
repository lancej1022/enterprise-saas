import { createFileRoute, redirect } from "@tanstack/react-router";

import { LoginPage } from "./-components/login-signup";

export const Route = createFileRoute("/signup")({
  component: LoginPage,

  beforeLoad: ({ context }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
});
