import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useColorScheme } from "nativewind";

import "../styles.css";

import { authClient } from "~/lib/auth-client";

const queryClient = new QueryClient();

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { data: session } = authClient.useSession();

  // useEffect(() => {
  //   void authClient.signOut();
  // }, []);

  // eslint-disable-next-line no-console -- debugging
  console.log("session:", session);
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar />
      {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: colorScheme == "dark" ? "#09090B" : "#FFFFFF",
          },
        }}
      >
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Expo Router includes all routes by default. Adding Stack.Protected creates exceptions for these screens. */}
      </Stack>
    </QueryClientProvider>
  );
}
