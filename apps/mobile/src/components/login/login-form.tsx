import { View } from "react-native";
import { useForm } from "@tanstack/react-form";
// import Svg, { Path } from "react-native-svg";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Text } from "#/components/ui/text";
import { P } from "#/components/ui/typography";
import { authClient } from "#/lib/auth-client";
import { Github } from "#/lib/icons/github";
import { cn } from "#/lib/utils";
import { z } from "zod/v4";

function HorizontalBar() {
  return <View className="h-[1px] flex-1 bg-border" />;
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      const res = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });

      if (res.error) {
        // toast.error(res.error.message);
        return;
      }
    },
  });

  return (
    // @ts-expect-error -- TODO: not sure what the issue is here. Borked tsconfig?
    <View
      className={cn("flex flex-col gap-6", className)}
      onSubmit={() => {
        void form.handleSubmit();
      }}
      {...props}
    >
      <View className="flex flex-col items-center gap-2 text-center">
        <Text aria-level={1} className="text-2xl font-bold" role="heading">
          Login to your account
        </Text>
        <P className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </P>
      </View>
      <View className="grid gap-6">
        <View className="grid gap-2">
          <form.Field
            children={(field) => (
              <>
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  aria-required={true}
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  placeholder="m@example.com"
                  value={field.state.value}
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <Text className="text-sm text-red-500">
                      {field.state.meta.errors
                        .map((err) => err?.message)
                        .join(",")}
                    </Text>
                  )}
              </>
            )}
            name="email"
          />
        </View>
        <View className="grid gap-2">
          <form.Field
            children={(field) => (
              <>
                <View className="flex flex-row items-center">
                  <Label htmlFor={field.name}>Password</Label>
                  <Text
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                    // href="#yeet"
                  >
                    Forgot your password?
                  </Text>
                </View>
                <Input
                  aria-required={true}
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  secureTextEntry={true}
                  value={field.state.value}
                />
                {field.state.meta.isBlurred &&
                  field.state.meta.errors.length > 0 && (
                    <Text className="text-sm text-red-500">
                      {field.state.meta.errors
                        .map((err) => err?.message)
                        .join(",")}
                    </Text>
                  )}
              </>
            )}
            name="password"
          />
        </View>
        <Button
          className="w-full"
          // TODO: this isnt accessible -- need to use aria-disabled or something
          disabled={form.state.isSubmitting}
          onPress={() => {
            void form.handleSubmit();
          }}
        >
          <Text>Login</Text>
        </Button>
        <View className="z-10 flex flex-row items-center justify-around gap-2 bg-background">
          <HorizontalBar />
          <Text className="relative z-10 bg-background px-2 text-center text-sm text-muted-foreground">
            Or continue with
          </Text>
          <HorizontalBar />
        </View>
        <Button className="flex w-full flex-row" variant="outline">
          <Github />
          <Text className="ml-2">Login with GitHub</Text>
        </Button>
      </View>
      <View
        className="flex flex-row items-center justify-center text-center text-sm"
        data-testid="login-form-footer"
      >
        <Text>Don&apos;t have an account? </Text>
        <Text
          className="underline underline-offset-4"
          // href="#"
        >
          Sign up
        </Text>
      </View>
    </View>
  );
}
