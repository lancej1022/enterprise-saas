import baseConfig from "@solved-contact/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist", "src/zero/schema.gen.ts"],
  },
  ...baseConfig,
];
