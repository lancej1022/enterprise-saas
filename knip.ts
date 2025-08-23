export default {
  $schema: "https://unpkg.com/knip@5/schema.json",
  ignore: ["apps/mobile/**", "apps/mobile"],
  ignoreWorkspaces: ["apps/mobile", "apps/mobile/**", "backend"],
  workspaces: {
    "apps/web": {
      entry: ["app/{index,router}.tsx"],
    },
    "apps/test-playground": {
      entry: ["src/router.tsx"],
    },
    "packages/chat-widget": {
      entry: ["src/index.ts", "src/router.tsx"],
    },
  },
};
