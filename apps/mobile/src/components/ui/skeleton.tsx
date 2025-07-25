import * as React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { cn } from "#/lib/utils";

const duration = 1000;

function Skeleton({
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof Animated.View>, "style">) {
  const sv = useSharedValue(1);

  React.useEffect(() => {
    sv.value = withRepeat(
      withSequence(withTiming(0.5, { duration }), withTiming(1, { duration })),
      -1,
    );
    // eslint-disable-next-line react-hooks/react-compiler -- this is directly from RNR
    // eslint-disable-next-line react-hooks/exhaustive-deps -- this is directly from RNR
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: sv.value,
  }));

  return (
    <Animated.View
      className={cn("bg-secondary dark:bg-muted rounded-md", className)}
      style={style}
      {...props}
    />
  );
}

export { Skeleton };
