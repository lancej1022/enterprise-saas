import { vars } from "nativewind";

// "If you changed the colors in the #/global.css file, update the #/lib/constants.ts file with the new colors. Each color has a commented css variable name next to it."
// ^^ https://www.reactnativereusables.com/getting-started/initial-setup/
export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(0 0% 100%)", // card
    notification: "hsl(0 84.2% 60.2%)", // destructive
    primary: "hsl(240 5.9% 10%)", // primary
    text: "hsl(240 10% 3.9%)", // foreground
  },
  dark: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(0 0% 98%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

// TODO: This `themes` was taken from the nativewind dark-mode example as part of debugging, but seems like the real issue with theme switching
// was not specifying the `darkMode: "class"` in the tailwind.config.ts file. This file is PROBABLY not needed for dark/light mode switching.
export const themes = {
  light: vars({
    "--color-primary": "#000000", // black
    "--color-secondary": "rgba(0, 0, 0, 0.1)", // gray-500
    "--color-background": "#ffffff", // white
    "--color-text": "#000000", // black text
  }),
  dark: vars({
    "--color-primary": "#ffffff", // white
    "--color-secondary": "rgba(255, 255, 255, 0.2)", // gray-400
    "--color-background": "#000000", // black
    "--color-text": "#ffffff", // white text
  }),
};
