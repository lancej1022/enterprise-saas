import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Text } from "#/components/ui/text";
import { Bell } from "#/lib/icons/Bell";
import { Book } from "#/lib/icons/Book";
import { Home } from "#/lib/icons/Home";
import { Keypad } from "#/lib/icons/Keypad";
import { Users } from "#/lib/icons/Users";
import { cn } from "#/lib/utils";

const TABS = [
  { key: "index", label: "Home", icon: Home, badge: 2 },
  { key: "team", label: "Team", icon: Users },
  { key: "keypad", label: "Keypad", icon: Keypad },
  { key: "contacts", label: "Contacts", icon: Book },
  { key: "activity", label: "Activity", icon: Bell },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: "row",
        // TODO: This should be dynamic based on the theme
        // backgroundColor: "#201C2B",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingVertical: 8,
        paddingBottom: insets.bottom || 8,
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;
        const Icon = tab.icon;
        return (
          <Pressable
            className="flex-1 items-center"
            key={tab.key}
            onPress={() => navigation.navigate(tab.key)}
          >
            <View className="relative">
              {/* TODO: How to invert the color of the icon based on the theme? */}
              <Icon color={isFocused ? "#A259FF" : "#B0AFC6"} size={26} />
              {tab.badge && (
                <View className="absolute -right-3 -top-1.5 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#FF3B30]">
                  <Text className="text-xs font-bold text-white">
                    {tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className={cn(
                "text-[#B0AFC6]",
                isFocused && "font-bold text-[#A259FF]",
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      {/* Add the other screens as needed */}
      {/* <Tabs.Screen name="team" options={{ title: "Team" }} /> */}
      {/* <Tabs.Screen name="keypad" options={{ title: "Keypad" }} /> */}
      {/* <Tabs.Screen name="contacts" options={{ title: "Contacts" }} /> */}
      {/* <Tabs.Screen name="activity" options={{ title: "Activity" }} /> */}
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
