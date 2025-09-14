import baseConfig from "@solved-contact/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**", ".cache/**", ".turbo/**"],
  },
  ...baseConfig,
];
