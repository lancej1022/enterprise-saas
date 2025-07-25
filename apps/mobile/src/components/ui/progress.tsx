import * as React from "react";
import { Platform, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";
import * as ProgressPrimitive from "@rn-primitives/progress";

import { cn } from "#/lib/utils";

function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: ProgressPrimitive.RootProps & {
  indicatorClassName?: string;
  ref?: React.RefObject<ProgressPrimitive.RootRef>;
}) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "bg-secondary relative h-4 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <Indicator className={indicatorClassName} value={value} />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

function Indicator({
  value,
  className,
}: {
  className?: string;
  value: null | number | undefined;
}) {
  const progress = useDerivedValue(() => value ?? 0);

  const indicator = useAnimatedStyle(() => {
    return {
      width: withSpring(
        `${interpolate(progress.value, [0, 100], [1, 100], Extrapolation.CLAMP)}%`,
        { overshootClamping: true },
      ),
    };
  });

  if (Platform.OS === "web") {
    return (
      <View
        className={cn(
          "web:transition-all bg-primary h-full w-full flex-1",
          className,
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      >
        <ProgressPrimitive.Indicator
          className={cn("h-full w-full", className)}
        />
      </View>
    );
  }

  return (
    <ProgressPrimitive.Indicator asChild>
      <Animated.View
        className={cn("bg-foreground h-full", className)}
        style={indicator}
      />
    </ProgressPrimitive.Indicator>
  );
}
