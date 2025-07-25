import { Text, View } from "react-native";
import { Link, Stack } from "expo-router";

import { Container } from "#/components/container";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <Container>
        <View className="flex-1 items-center justify-center p-6">
          <View className="items-center">
            <Text className="mb-4 text-6xl">🤔</Text>
            <Text className="text-foreground mb-2 text-center text-2xl font-bold">
              Page Not Found
            </Text>
            <Text className="text-muted-foreground mb-8 max-w-sm text-center">
              Sorry, the page you're looking for doesn't exist.
            </Text>
            <Link asChild href="/">
              <Text className="text-primary bg-primary/10 rounded-lg px-6 py-3 font-medium">
                Go to Home
              </Text>
            </Link>
          </View>
        </View>
      </Container>
    </>
  );
}
