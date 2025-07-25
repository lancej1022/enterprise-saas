import React from "react";
import { SafeAreaView } from "react-native";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="bg-background flex-1">{children}</SafeAreaView>
  );
}
