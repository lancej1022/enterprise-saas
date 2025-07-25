import * as React from "react";
import { Platform } from "react-native";
import * as CheckboxPrimitive from "@rn-primitives/checkbox";

import { Check } from "#/lib/icons/Check";
import { cn } from "#/lib/utils";

function Checkbox({
  className,
  ...props
}: CheckboxPrimitive.RootProps & {
  ref?: React.RefObject<CheckboxPrimitive.RootRef>;
}) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "web:peer native:h-[20] native:w-[20] native:rounded web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 border-primary h-4 w-4 shrink-0 rounded-sm border disabled:cursor-not-allowed disabled:opacity-50",
        props.checked && "bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("h-full w-full items-center justify-center")}
      >
        <Check
          className="text-primary-foreground"
          size={12}
          strokeWidth={Platform.OS === "web" ? 2.5 : 3.5}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
