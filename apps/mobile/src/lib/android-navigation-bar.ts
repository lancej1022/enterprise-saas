import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

import { NAV_THEME } from "#/lib/constants";

export async function setAndroidNavigationBar(theme: "dark" | "light") {
  if (Platform.OS !== "android") return;
  await NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
  await NavigationBar.setBackgroundColorAsync(
    theme === "dark" ? NAV_THEME.dark.background : NAV_THEME.light.background,
  );
}
