import { View } from "react-native";
import { useForm } from "@tanstack/react-form";

// import Svg, { Path } from "react-native-svg";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { P } from "~/components/ui/typography";
import { Github } from "~/lib/icons/github";
import { cn } from "~/lib/utils";

function HorizontalBar() {
  return <View className="h-[1px] flex-1 bg-border" />;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  // const { mutate, isPending } = useSignup();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    // validators: { onBlur: signupBody },
    onSubmit: (_data) => {
      // console.log("data:", data);
      // const { email, password } = data.value;
      // TODO: is there a way to make the generated `orval` code accept `{email, password}` instead of `{data: {email, password} }`?
      // mutate({ data: { email, password } });
    },
  });

  return (
    // TODO: need to figure out how to make this trigger via `Enter` so web isnt borked
    // This might be doable by embedding a child `form` element and handling the submit event -- https://discord.com/channels/719702312431386674/1277546385411149824/1277658808755159152
    // but it will need to be tested against `expo` to see if that works
    <View
      className={cn("flex flex-col gap-6", className)}
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      // @ts-expect-error -- TODO: idk why this is throwing an error, but it works fine on web
      role="form"
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
                {/* {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <em>
                      {field.state.meta.errors
                        .map((err) => err?.message)
                        .join(",")}
                    </em>
                  )} */}
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
                {/* {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <em>
                      {field.state.meta.errors
                        .map((err) => err?.message)
                        .join(",")}
                    </em>
                  )} */}
              </>
            )}
            name="password"
          />
        </View>
        <Button
          className="w-full"
          // TODO: this isnt accessible -- need to use aria-disabled or something
          // disabled={isPending}
          // // eslint-disable-next-line @typescript-eslint/unbound-method
          // onPress={form.handleSubmit}
          // @ts-expect-error -- TODO: not sure if `type` is valid or not
          type="submit"
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
