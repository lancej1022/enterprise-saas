import { useColorScheme as useNativewindColorScheme } from "nativewind";

export function useColorScheme() {
  // eslint-disable-next-line @typescript-eslint/unbound-method -- this is copy-pasted from the RNR docs
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useNativewindColorScheme();
  return {
    colorScheme: colorScheme ?? "dark",
    isDarkColorScheme: colorScheme === "dark",
    setColorScheme,
    toggleColorScheme,
  };
}
