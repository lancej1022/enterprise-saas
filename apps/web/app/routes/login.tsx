import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod/v4";

import { LoginPage } from "./-components/login-signup";

const fallback = "/";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.session.data) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
});
