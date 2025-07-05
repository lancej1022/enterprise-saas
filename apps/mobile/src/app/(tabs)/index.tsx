import { Alert, View } from "react-native";
import { Button } from "#/components/ui/button";
import { Header } from "#/components/ui/Header";
import { Text } from "#/components/ui/text";
import { authClient } from "#/lib/auth-client";

export default function IndexScreen() {
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
      <Button onPress={() => authClient.signOut()}>
        <Text>Logout</Text>
      </Button>
    </View>
  );
}
