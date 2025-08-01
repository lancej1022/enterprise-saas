import { Image, View } from "react-native";

import { Text } from "#/components/ui/text";
import { GalleryVerticalEnd } from "#/lib/icons/gallery-vertical-end";
import { LoginForm } from "./login-form";

function Branding() {
  return (
    <View
      // TODO: when this is a `Text` w/ href, it causes the row to sit to the far left on mobile only for some reason
      // href="#"
      className="flex flex-row items-center justify-center gap-2 text-center font-medium"
    >
      <View className="bg-primary text-primary-foreground flex h-6 w-6 flex-row items-center justify-center self-center rounded-md">
        {/* TODO: this seems like its the wrong size for some reason... */}
        <GalleryVerticalEnd className="text-primary-foreground size-4" />
      </View>
      <Text>Solved Contact</Text>
    </View>
  );
}

export function LoginScreen() {
  return (
    <View className="flex flex-row items-center justify-center">
      <View className="flex flex-1 flex-col gap-5">
        <Branding />

        <View
          className="flex flex-shrink flex-grow basis-auto flex-row items-baseline justify-center"
          data-testid="login-form-wrap"
        >
          <View className="w-full max-w-xs">
            <LoginForm />
          </View>
        </View>
      </View>
      <View className="bg-muted relative hidden lg:flex lg:flex-shrink lg:flex-grow">
        <Image
          // TODO: specify an image source
          // source={require('@chat-app/assets/placeholder.svg')} TODO: add placeholder image
          alt="chat app company logo"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </View>
    </View>
  );
}
