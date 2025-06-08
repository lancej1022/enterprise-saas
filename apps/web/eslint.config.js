import baseConfig from "@acme/eslint-config/base";
import reactConfig from "@acme/eslint-config/react";
import webConfig from "@acme/eslint-config/web";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["./src/routeTree.gen.ts"],
  },
  ...baseConfig,
  ...reactConfig,
  ...webConfig,
];
