import { View } from "react-native";
import { Button } from "#/components/ui/button";
import { Text } from "#/components/ui/text";
import { authClient } from "#/lib/auth-client";

export default function IndexScreen() {
  return (
    <View>
      <Text>Index screen</Text>
      <Button onPress={() => authClient.signOut()}>
        <Text>Logout</Text>
      </Button>
    </View>
  );
}
