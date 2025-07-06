// TODO: This file was taken from the nativewind dark-mode example as part of debugging, but seems like the real issue with theme switching
// was not specifying the `darkMode: "class"` in the tailwind.config.ts file. This file is PROBABLY not needed for dark/light mode switching.
import React, { createContext, useContext, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colorScheme } from "nativewind";

import { themes } from "../lib/constants";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- TODO: from nativewind example
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">("light");

  // eslint-disable-next-line no-console -- TODO: from nativewind example
  console.log("ThemeProvider - currentTheme:", currentTheme);

  function toggleTheme() {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    colorScheme.set(newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <StatusBar style={currentTheme === "dark" ? "light" : "dark"} />
      <View className="flex-1" style={themes[currentTheme]}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- TODO: from nativewind example
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
