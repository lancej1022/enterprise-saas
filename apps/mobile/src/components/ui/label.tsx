import * as React from "react";
import * as LabelPrimitive from "@rn-primitives/label";

import { cn } from "#/lib/utils";

function Label({
  className,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  ...props
}: LabelPrimitive.TextProps & {
  ref?: React.RefObject<LabelPrimitive.TextRef>;
}) {
  return (
    <LabelPrimitive.Root
      className="web:cursor-default"
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <LabelPrimitive.Text
        className={cn(
          "native:text-base web:peer-disabled:cursor-not-allowed web:peer-disabled:opacity-70 text-foreground text-sm leading-none font-medium",
          className,
        )}
        {...props}
      />
    </LabelPrimitive.Root>
  );
}

export { Label };
