import baseConfig from "@solved-contact/eslint-config/base";
import nativeConfig from "@solved-contact/eslint-config/native";
import reactConfig from "@solved-contact/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nativeConfig,
];
