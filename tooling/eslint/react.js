import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import * as reactHooks from "eslint-plugin-react-hooks";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  reactHooks.configs.recommended,
  reactYouMightNotNeedAnEffect.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs["jsx-runtime"].rules,
      "react-hooks/react-compiler": "error",
      "react-you-might-not-need-an-effect/no-derived-state": "error",
      "react-you-might-not-need-an-effect/no-chain-state-updates": "error",
      "react-you-might-not-need-an-effect/no-initialize-state": "error",
      "react-you-might-not-need-an-effect/no-event-handler": "error",
      "react-you-might-not-need-an-effect/no-reset-all-state-when-a-prop-changes":
        "error",
      "react-you-might-not-need-an-effect/no-pass-live-state-to-parent":
        "error",
      "react-you-might-not-need-an-effect/no-pass-data-to-parent": "error",
      "react-you-might-not-need-an-effect/no-manage-parent": "error",
    },
    languageOptions: {
      globals: {
        React: "writable",
      },
    },
  },
];
