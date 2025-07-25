import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as HoverCardPrimitive from "@rn-primitives/hover-card";

import { TextClassContext } from "#/components/ui/text";
import { cn } from "#/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: HoverCardPrimitive.ContentProps & {
  ref?: React.RefObject<HoverCardPrimitive.ContentRef>;
}) {
  const { open } = HoverCardPrimitive.useRootContext();
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Overlay
        style={Platform.OS !== "web" ? StyleSheet.absoluteFill : undefined}
      >
        <Animated.View entering={FadeIn}>
          <TextClassContext.Provider value="text-popover-foreground">
            <HoverCardPrimitive.Content
              align={align}
              className={cn(
                "web:outline-none web:cursor-auto border-border bg-popover shadow-foreground/5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 rounded-md border p-4 shadow-md",
                open
                  ? "web:animate-in web:fade-in-0 web:zoom-in-95"
                  : "web:animate-out web:fade-out-0 web:zoom-out-95",
                className,
              )}
              sideOffset={sideOffset}
              {...props}
            />
          </TextClassContext.Provider>
        </Animated.View>
      </HoverCardPrimitive.Overlay>
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
