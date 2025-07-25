import baseConfig from "@solved-contact/eslint-config/base";
import reactConfig from "@solved-contact/eslint-config/react";
import webConfig from "@solved-contact/eslint-config/web";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [
      "./app/routeTree.gen.ts",
      ".tanstack",
      ".output",
      ".nitro",
      ".vercel",
      "./zero/schema.gen.ts",
    ],
  },
  ...baseConfig,
  ...reactConfig,
  ...webConfig,
];
