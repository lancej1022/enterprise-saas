import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";

import { getBaseUrl } from "#/utils/base-url";

const baseUrl = getBaseUrl();

export const authClient = createAuthClient({
  baseURL: baseUrl,
  plugins: [
    expoClient({
      // scheme: "your.bundle.identifier",
      storagePrefix: "my-better-t-app",
      storage: SecureStore,
    }),
  ],
});
