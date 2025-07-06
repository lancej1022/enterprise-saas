// TODO: This file was taken from the nativewind dark-mode example as part of debugging, but seems like the real issue with theme switching
// was not specifying the `darkMode: "class"` in the tailwind.config.ts file. This file is PROBABLY not needed for dark/light mode switching.
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Feather from "@expo/vector-icons/Feather";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const translateX = useSharedValue(isDark ? 46 : 3.5);

  useEffect(() => {
    translateX.value = withSpring(isDark ? 46 : 3.5, {
      damping: 15,
      stiffness: 150,
    });
  }, [isDark]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Pressable
      className="relative h-12 w-24 flex-row items-center justify-between rounded-full bg-secondary p-1"
      onPress={toggleTheme}
    >
      <Icon icon="sun" />
      <Icon icon="moon" />
      <Animated.View
        className="absolute flex h-10 w-10 flex-row items-center justify-center rounded-full bg-background"
        style={[animatedStyle]}
      />
    </Pressable>
  );
}

function Icon(props: { icon: keyof typeof Feather.glyphMap }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View className="relative z-50 flex h-10 w-10 flex-row items-center justify-center rounded-full">
      <Feather
        color={`${isDark ? "white" : "black"}`}
        name={props.icon}
        size={20}
      />
    </View>
  );
}

export default ThemeToggle;
