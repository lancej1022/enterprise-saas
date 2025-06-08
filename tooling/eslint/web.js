import pluginRouter from "@tanstack/eslint-plugin-router";

/** @type {Awaited<import('typescript-eslint').Config>} */
export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@tanstack/router": pluginRouter,
    },
    rules: {
      "@tanstack/router/create-route-property-order": "error",
      // Tanstack router uses a `throw redirect` pattern that constantly triggers this rule
      "@typescript-eslint/only-throw-error": "off",
    },
  },
];
