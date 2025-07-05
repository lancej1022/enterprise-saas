import { SafeAreaView } from "react-native";

import { LoginScreen } from "~/components/login/login-screen";

export default function Login() {
  return (
    <SafeAreaView className="bg-background">
      <LoginScreen />
    </SafeAreaView>
  );
}
