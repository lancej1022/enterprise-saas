import type { KnipConfig } from "knip";

export default {
  $schema: "https://unpkg.com/knip@5/schema.json",
  compilers: {
    // https://github.com/webpro-nl/knip/issues/1008#issuecomment-3207756199
    css: (text: string) =>
      [
        ...text.replaceAll("plugin", "import").matchAll(/(?<=@)import[^;]+/g),
      ].join("\n"),
  },
  ignore: ["**/routeTree.gen.ts"],
  ignoreWorkspaces: ["apps/mobile", "apps/mobile/**", "backend"],
  // wait-on is currently used in the auth-server dev script but knip cannot detect it because it is run through `concurrently`
  ignoreDependencies: ["wait-on"],
  tags: ["-lintignore"],
  workspaces: {
    ".": {
      entry: ["turbo/generators/config.ts"],
    },
    "apps/web": {
      entry: ["app/{index,router}.tsx", "playwright/signup-flow.setup.ts"],
    },
    "apps/auth-server": {
      entry: ["src/zero/mutators.ts", "src/db/schema/auth.ts"],
    },
    "apps/test-playground": {
      entry: ["src/router.tsx"],
    },
    "packages/chat-widget": {
      entry: ["src/index.ts", "src/router.tsx", "src/styles.css"],
    },
  },
} satisfies KnipConfig;
