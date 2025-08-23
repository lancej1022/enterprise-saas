export default {
  $schema: "https://unpkg.com/knip@5/schema.json",
  ignore: ["apps/mobile/**", "apps/mobile"],
  ignoreWorkspaces: ["apps/mobile", "apps/mobile/**", "backend"],
  workspaces: {
    "apps/web": {
      entry: [
        "app/{index,router}.tsx",
        //  "eslint.config.js"
      ],
    },
    "apps/test-playground": {
      entry: ["src/router.tsx", "eslint.config.js"],
    },
    // "apps/auth-server": {
    //   entry: ["eslint.config.js"],
    // },
    "packages/chat-widget": {
      entry: ["eslint.config.js", "src/index.ts", "src/router.tsx"],
    },
    "packages/web-ui": {
      entry: ["eslint.config.js"],
    },
  },
};
