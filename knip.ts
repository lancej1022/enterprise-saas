export default {
  $schema: "https://unpkg.com/knip@5/schema.json",
  ignore: ["**/routeTree.gen.ts"],
  ignoreWorkspaces: ["apps/mobile", "apps/mobile/**", "backend"],
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
      entry: ["src/index.ts", "src/router.tsx"],
    },
  },
};
