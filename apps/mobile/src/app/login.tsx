import { SafeAreaView } from "react-native";
import { LoginScreen } from "#/components/login/login-screen";

export default function Login() {
  return (
    <SafeAreaView className="flex-1 justify-center bg-background">
      <LoginScreen />
    </SafeAreaView>
  );
}
