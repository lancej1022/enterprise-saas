import { fixupPluginRules } from "@eslint/compat";
// TODO: having a hard time getting the expo config import to work with `import` syntax :/
// import expoConfig from "eslint-config-expo/flat";
// @ts-expect-error - eslint-plugin-react-native is not typed
import reactNative from "eslint-plugin-react-native";

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  // expoConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "react-native": fixupPluginRules(reactNative),
    },
    rules: {
      "react-native/no-raw-text": [
        "error",
        {
          skip: ["Text", "P", "Label"],
        },
      ],
    },
  },
];
