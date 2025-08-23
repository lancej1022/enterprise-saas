import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { wrapVinxiConfigWithSentry } from "@sentry/tanstackstart-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
// import { externalizeDeps } from "vite-plugin-externalize-deps";
import noBundlePlugin from "vite-plugin-no-bundle";
import viteTsConfigPaths from "vite-tsconfig-paths";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackRouter({
      target: "react",
      // autoCodeSplitting: true,
    }),
    viteReact(),
    noBundlePlugin(),
    dts({
      // insertTypesEntry: true,
      include: ["src/**/*"],
      exclude: ["src/**/*.test.*", "src/**/*.spec.*"],
      outDir: "dist",
      // rollupTypes: true,
      compilerOptions: {
        declaration: true,
        declarationMap: true,
        skipLibCheck: true,
      },
    }),
    // externalizeDeps(),
  ],

  build: {
    // TODO: Need to minify UMD builds, but should be fine to leave ESM unminified so that the built code is readable
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/router.tsx"),
      name: "ChatWidget",
      // fileName: (format, entryName) => `${format}/${entryName}.js`,
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: "style",
      formats: [
        "es",
        // "umd"
      ],
    },
    // rollupOptions: {
    //   // external: [
    //   //   "react",
    //   //   "react-dom",
    //   //   "@tanstack/react-router",
    //   //   "@tanstack/react-query",
    //   // ],
    //   output: {
    //     // globals: {
    //     //   // No external globals needed since we're bundling everything
    //     // },
    //     // exports: "named",
    //     inlineDynamicImports: true,
    //   },
    // },
  },
});

export default wrapVinxiConfigWithSentry(config, {
  org: process.env.VITE_SENTRY_ORG,
  project: process.env.VITE_SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Only print logs for uploading source maps in CI
  // Set to `true` to suppress logs
  silent: !process.env.CI,
});
