// @ts-expect-error - no types
import nativewind from "nativewind/preset";
import { type Config } from "tailwindcss";
import baseConfig from "@solved-contact/tailwind-config/native";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  presets: [baseConfig, nativewind],
} satisfies Config;
