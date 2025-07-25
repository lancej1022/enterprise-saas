import { Alert, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { Button } from "#/components/ui/button";
import { Header } from "#/components/ui/Header";
import { Text } from "#/components/ui/text";
import { authClient } from "#/lib/auth-client";
import { orpc } from "#/utils/orpc";

export default function IndexScreen() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  const { isLoading, data: privateData } = useQuery(
    orpc.privateData.queryOptions(),
  );
  return (
    <View>
      <Header
        avatarUrl="https://randomuser.me/api/portraits/women/44.jpg"
        badgeEmoji="🚀"
        onFilterPress={() => Alert.alert("Filter pressed")}
        onSearchPress={() => Alert.alert("Search pressed")}
        subtitle="(415) 123-9876"
        title="Customer support"
      />
      <Text>Index screen</Text>
      <View className="border-border mb-6 rounded-lg border p-4">
        <Text className="text-foreground mb-3 font-medium">API Status</Text>
        <View className="flex-row items-center gap-2">
          <View
            className={`h-3 w-3 rounded-full ${
              healthCheck.data ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <Text className="text-muted-foreground">
            {healthCheck.isLoading
              ? "Checking..."
              : healthCheck.data
                ? "Connected to API"
                : "API Disconnected"}
          </Text>
        </View>
      </View>
      {!isLoading && privateData && (
        <View>
          <Text className="text-muted-foreground">
            Private user data: `{JSON.stringify(privateData.user)}`
          </Text>
        </View>
      )}
      <Button onPress={() => authClient.signOut()}>
        <Text>Logout</Text>
      </Button>
    </View>
  );
}
