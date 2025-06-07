/// <reference types="./types.d.ts" />

import { join } from "node:path";
// @ts-expect-error https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/214
import ESLintPluginESLintCommentsConfigs from "@eslint-community/eslint-plugin-eslint-comments/configs";
import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

// The plugin is not currently exported from the root, so we have to get the plugin from the config.
// https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/215#issuecomment-2140949371
const ESLintPluginESLintComments =
  ESLintPluginESLintCommentsConfigs.recommended.plugins[
    "@eslint-community/eslint-comments"
  ];

/**
 * All packages that leverage t3-env should use this rule
 */
export const restrictEnvAccess = tseslint.config(
  { ignores: ["**/env.ts"] },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          name: "process",
          importNames: ["env"],
          message:
            "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
    },
  },
);

export default tseslint.config(
  // Ignore files not tracked by VCS and any config files
  includeIgnoreFile(join(import.meta.dirname, "../../.gitignore")),
  { ignores: ["**/*.config.*"] },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
      turbo: turboPlugin,
      "@eslint-community/eslint-comments": ESLintPluginESLintComments,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      ...turboPlugin.configs.recommended.rules,
      // handled by `unused-imports/no-unused-imports`
      "@typescript-eslint/no-unused-vars": "off",
      // provides an autofixable version of no-unused-vars, for imports specifically
      "unused-imports/no-unused-imports": "error",
      // TODO: not clear if we really need `consistent-type-imports` since we also have `import/consistent-type-specifier-style` in place...
      // this rule improves tree-shaking by ensuring types are consistently imported in a way that allows them to be removed from production bundles
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // disallows unsafe type casting
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      // https://www.totaltypescript.com/react-apps-ts-performance -- `interface` is more performant during type-checking compared to `type`, especially in large codebases
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      // Explicit type annotations add unnecessary verbosity to code and in some cases can prevent TypeScript from inferring a more specific literal type (e.g. `10` instead `number`)
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          allowConstantLoopConditions: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      // `prefer-nullish-coalescing` can lead to bugs in cases where `||` is needed
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "import/consistent-type-specifier-style": ["error", "prefer-inline"],
      "no-restricted-imports": [
        "error",
        {
          name: "zod",
          message: "Use `import { z } from 'zod/v4'` instead to ensure v4.",
        },
      ],
      "@eslint-community/eslint-comments/require-description": [
        "error",
        { ignore: [] },
      ],
      "no-console": ["error", { allow: ["error"] }],
      // improves perf and reduces bugs by ensuring devs dont write code where the operators behave differently from the way the developer thought they would
      "no-constant-binary-expression": "error",
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { parserOptions: { projectService: true } },
  },
);
