import * as React from "react";
import { Text as RNText } from "react-native";
import * as Slot from "@rn-primitives/slot";

import { cn } from "#/lib/utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<typeof RNText> & {
  asChild?: boolean;
  ref?: React.RefObject<RNText>;
}) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn(
        "web:select-text text-foreground text-base",
        textClass,
        className,
      )}
      {...props}
    />
  );
}

export { Text, TextClassContext };
