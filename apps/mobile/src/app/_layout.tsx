import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useColorScheme } from "#/lib/use-color-scheme";

import "../styles.css";

import { useLayoutEffect } from "react";
import { Appearance, Platform } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from "@react-navigation/native";

import { ThemeToggle } from "#/components/theme-toggle/theme-toggle";
import { setAndroidNavigationBar } from "#/lib/android-navigation-bar";
import { authClient } from "#/lib/auth-client";
import { NAV_THEME } from "#/lib/constants";

const queryClient = new QueryClient();

function useSetAndroidNavigationBar() {
  useLayoutEffect(() => {
    void setAndroidNavigationBar(Appearance.getColorScheme() ?? "light");
  }, []);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional
function noop() {}

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

const usePlatformSpecificSetup = Platform.select({
  android: useSetAndroidNavigationBar,
  default: noop,
});

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  usePlatformSpecificSetup();
  const { isDarkColorScheme, colorScheme } = useColorScheme();
  // TODO: This doesnt seem to consistently re-render after the `login` is successful. Might need to review LoginForm
  const { data: session, isPending } = authClient.useSession();

  // useEffect(() => {
  //   void authClient.signOut();
  // }, []);

  // eslint-disable-next-line no-console -- debugging
  console.log("session:", session);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar />
        {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
        {/* TODO: probably need some sort of better loading state here... */}
        {isPending ? null : (
          <Stack
            screenOptions={{
              contentStyle: {
                backgroundColor: colorScheme == "dark" ? "#09090B" : "#FFFFFF",
              },
            }}
          >
            <Stack.Protected guard={!!session}>
              <Stack.Screen
                name="(tabs)"
                options={{
                  title: "Solved Contact",
                  headerRight: () => <ThemeToggle />,
                }}
              />
            </Stack.Protected>
            <Stack.Protected guard={!session}>
              <Stack.Screen name="login" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
