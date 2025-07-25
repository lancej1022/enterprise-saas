import {
  Link,
  useLocation,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { authClient } from "auth/client";
// TODO: replace with shadcn toast
import { toast } from "sonner";
import { z } from "zod/v4";
import { Button } from "@solved-contact/ui/components/button";
import { Input } from "@solved-contact/ui/components/input";
import { Label } from "@solved-contact/ui/components/label";
import { cn } from "@solved-contact/ui/lib/utils";

import { useAppForm } from "#/components/tanstack-form";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm(props: React.ComponentProps<"form">) {
  // TODO: Invariant failed: Could not find an active match from "/signup" seems to be caused, potentially because of the unclear redirect logic?
  const navigate = useNavigate();
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  const isSignup = pathname === "/signup";
  const redirectPath = useSearch({
    from: isSignup ? "/signup" : "/login",
    select: (search) => ("redirect" in search ? search.redirect : undefined),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      if (isSignup) {
        const res = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.email,
        });
        if (res.error) {
          toast.error(res.error.message);
          return;
        }
      } else {
        const res = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          // callbackURL,
        });
        if (res.error) {
          toast.error(res.error.message);
          return;
        }
      }

      await navigate({
        // from: isSignup ? "/signup" : "/login",
        to: redirectPath || "/",
      });
    },
  });

  return (
    <form.AppForm {...props}>
      <form
        className={cn("flex flex-col gap-6", props.className)}
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">
            {isSignup ? "Sign up for an account" : "Login to your account"}
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            {isSignup
              ? "Enter your email below to create an account"
              : "Enter your email below to login to your account"}
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <form.AppField
              children={(field) => (
                <>
                  <field.TextField label="Email" required />
                  {field.state.meta.isTouched && !field.state.meta.isValid && (
                    <em>
                      {field.state.meta.errors
                        .map((err) => err?.message)
                        .join(",")}
                    </em>
                  )}
                </>
              )}
              name="email"
            />
          </div>
          <div className="grid gap-3">
            <form.Field
              children={(field) => (
                <>
                  <div className="flex items-center">
                    <Label className="gap-1" htmlFor={field.name}>
                      Password
                      <span aria-hidden className="text-destructive">
                        *
                      </span>
                    </Label>
                    <a
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                      href="#"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    type="password"
                    value={field.state.value}
                  />
                  {field.state.meta.isTouched && !field.state.meta.isValid && (
                    <em>
                      {field.state.meta.errors
                        .map((err) => err?.message)
                        .join(",")}
                    </em>
                  )}
                </>
              )}
              name="password"
            />
          </div>
          <Button className="w-full" type="submit">
            {isSignup ? "Sign up" : "Login"}
          </Button>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
          <Button className="w-full" variant="outline">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button>
        </div>
        <div className="text-center text-sm">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link className="underline underline-offset-4" to="/login">
                Login
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link className="underline underline-offset-4" to="/signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </form>
    </form.AppForm>
  );
}
