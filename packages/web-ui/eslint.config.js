// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import baseConfig from "@solved-contact/eslint-config/base";
import reactConfig from "@solved-contact/eslint-config/react";
import webConfig from "@solved-contact/eslint-config/web";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["./src/routeTree.gen.ts"],
  },
  ...baseConfig,
  ...reactConfig,
  ...webConfig,
  ...storybook.configs["flat/recommended"],
];
