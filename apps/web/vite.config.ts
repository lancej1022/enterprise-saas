import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths(),
    tanstackStart({
      target: "vercel",
      tsr: {
        srcDirectory: "app",
      },
      spa: {
        enabled: true,
      },
      customViteReactPlugin: true,
    }),
    viteReact(),
  ],
});
