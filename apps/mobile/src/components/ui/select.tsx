import * as React from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as SelectPrimitive from "@rn-primitives/select";

import { Check } from "#/lib/icons/check";
import { ChevronDown } from "#/lib/icons/chevron-down";
import { ChevronUp } from "#/lib/icons/chevron-up";
import { cn } from "#/lib/utils";

type Option = SelectPrimitive.Option;

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

function SelectTrigger({
  ref,
  className,
  children,
  ...props
}: SelectPrimitive.TriggerProps & {
  children?: React.ReactNode;
  ref?: React.RefObject<SelectPrimitive.TriggerRef>;
}) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "native:h-12 web:ring-offset-background web:focus:outline-none web:focus:ring-2 web:focus:ring-ring web:focus:ring-offset-2 border-input bg-background text-muted-foreground flex h-10 flex-row items-center justify-between rounded-md border px-3 py-2 text-sm [&>span]:line-clamp-1",
        props.disabled && "web:cursor-not-allowed opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden={true}
        className="text-foreground opacity-50"
        size={16}
      />
    </SelectPrimitive.Trigger>
  );
}

/**
 * Platform: WEB ONLY
 */
function SelectScrollUpButton({
  className,
  ...props
}: SelectPrimitive.ScrollUpButtonProps) {
  if (Platform.OS !== "web") {
    return null;
  }
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        "web:cursor-default flex items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUp className="text-foreground" size={14} />
    </SelectPrimitive.ScrollUpButton>
  );
}

/**
 * Platform: WEB ONLY
 */
function SelectScrollDownButton({
  className,
  ...props
}: SelectPrimitive.ScrollDownButtonProps) {
  if (Platform.OS !== "web") {
    return null;
  }
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        "web:cursor-default flex items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDown className="text-foreground" size={14} />
    </SelectPrimitive.ScrollDownButton>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  portalHost,
  ...props
}: SelectPrimitive.ContentProps & {
  className?: string;
  portalHost?: string;
  ref?: React.RefObject<SelectPrimitive.ContentRef>;
}) {
  const { open } = SelectPrimitive.useRootContext();

  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <SelectPrimitive.Overlay
        style={Platform.OS !== "web" ? StyleSheet.absoluteFill : undefined}
      >
        <Animated.View className="z-50" entering={FadeIn} exiting={FadeOut}>
          <SelectPrimitive.Content
            className={cn(
              "border-border bg-popover shadow-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] rounded-md border px-1 py-2 shadow-md",
              position === "popper" &&
                "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
              open
                ? "web:zoom-in-95 web:animate-in web:fade-in-0"
                : "web:zoom-out-95 web:animate-out web:fade-out-0",
              className,
            )}
            position={position}
            {...props}
          >
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport
              className={cn(
                "p-1",
                position === "popper" &&
                  "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
              )}
            >
              {children}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
          </SelectPrimitive.Content>
        </Animated.View>
      </SelectPrimitive.Overlay>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.LabelProps & {
  ref?: React.RefObject<SelectPrimitive.LabelRef>;
}) {
  return (
    <SelectPrimitive.Label
      className={cn(
        "native:pb-2 native:pl-10 native:text-base text-popover-foreground py-1.5 pr-2 pl-8 text-sm font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.ItemProps & {
  ref?: React.RefObject<SelectPrimitive.ItemRef>;
}) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "web:group web:cursor-default web:select-none native:py-2 native:pl-10 web:hover:bg-accent/50 web:outline-none web:focus:bg-accent active:bg-accent relative flex w-full flex-row items-center rounded-sm py-1.5 pr-2 pl-8",
        props.disabled && "web:pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <View className="native:left-3.5 native:pt-px absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check
            className="text-popover-foreground"
            size={16}
            strokeWidth={3}
          />
        </SelectPrimitive.ItemIndicator>
      </View>
      <SelectPrimitive.ItemText className="native:text-lg native:text-base web:group-focus:text-accent-foreground text-popover-foreground text-sm" />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.SeparatorProps & {
  ref?: React.RefObject<SelectPrimitive.SeparatorRef>;
}) {
  return (
    <SelectPrimitive.Separator
      className={cn("bg-muted -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
};
