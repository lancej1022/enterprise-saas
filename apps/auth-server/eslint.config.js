import baseConfig from "@acme/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["./src/routeTree.gen.ts"],
  },
  ...baseConfig,
];
