import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// import { externalizeDeps } from "vite-plugin-externalize-deps";
import viteTsConfigPaths from "vite-tsconfig-paths";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    viteReact(),
    // noBundlePlugin(),
    // dts({
    //   // insertTypesEntry: true,
    //   include: ["src/**/*"],
    //   exclude: ["src/**/*.test.*", "src/**/*.spec.*"],
    //   outDir: "dist",
    //   // rollupTypes: true,
    //   compilerOptions: {
    //     declaration: true,
    //     declarationMap: true,
    //     skipLibCheck: true,
    //   },
    // }),
    // externalizeDeps(),
  ],

  build: {
    // TODO: Need to minify UMD builds, but should be fine to leave ESM unminified so that the built code is readable
    minify: false,
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

export default config;
