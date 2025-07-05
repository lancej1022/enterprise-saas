import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // TODO: what to set this to?
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: fix this
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  plugins: [
    expoClient({
      storagePrefix: "my-better-t-app",
      storage: SecureStore,
    }),
  ],
});
