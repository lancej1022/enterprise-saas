import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { wrapVinxiConfigWithSentry } from "@sentry/tanstackstart-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
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
    dts({
      insertTypesEntry: true,
      include: ["src/**/*"],
      exclude: ["src/**/*.test.*", "src/**/*.spec.*", "src/routeTree.gen.ts"],
      outDir: "dist",
      rollupTypes: true,
      compilerOptions: {
        declaration: true,
        declarationMap: true,
        skipLibCheck: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/router.tsx"),
      name: "ChatWidget",
      // TODO: update this build so that it can use import maps or something in order to allow CDN projects to load a codesplit version of the widget
      fileName: "index",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@tanstack/react-router",
        "@tanstack/react-query",
      ],
      output: {
        globals: {
          // No external globals needed since we're bundling everything
        },
        exports: "named",
      },
    },
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
