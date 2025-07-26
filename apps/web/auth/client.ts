import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

if (typeof import.meta.env === "undefined") {
  // @ts-expect-error -- this is a hack to make sure `import.meta.env` doesnt crash playwright
  import.meta.env = {};
}

// TODO: the only reason we need the `process.env` fallback is because playwright somehow trips over `import.meta.env`
const BASE_URL = import.meta.env.VITE_SERVER_URL || process.env.VITE_SERVER_URL;

if (!BASE_URL) {
  throw new Error("VITE_SERVER_URL is not set");
}

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [
    organizationClient({
      teams: {
        enabled: true,
        // maximumTeams: 10,
      },
    }),
  ],
});
