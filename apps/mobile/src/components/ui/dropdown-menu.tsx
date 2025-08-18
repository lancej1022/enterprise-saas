import * as React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { StyleProp, TextProps, ViewStyle } from "react-native";
import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";

import { TextClassContext } from "#/components/ui/text";
import { Check } from "#/lib/icons/check";
import { ChevronDown } from "#/lib/icons/chevron-down";
import { ChevronRight } from "#/lib/icons/chevron-right";
import { ChevronUp } from "#/lib/icons/chevron-up";
import { cn } from "#/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuPrimitive.SubTriggerProps & {
  children?: React.ReactNode;
  className?: string;
  inset?: boolean;
  ref?: React.RefObject<DropdownMenuPrimitive.SubTriggerRef>;
}) {
  const { open } = DropdownMenuPrimitive.useSubContext();
  const Icon =
    Platform.OS === "web" ? ChevronRight : open ? ChevronUp : ChevronDown;
  return (
    <TextClassContext.Provider
      value={cn(
        "native:text-lg text-primary text-sm select-none",
        open && "native:text-accent-foreground",
      )}
    >
      <DropdownMenuPrimitive.SubTrigger
        className={cn(
          "web:cursor-default web:select-none web:focus:bg-accent web:hover:bg-accent native:py-2 web:outline-none active:bg-accent flex flex-row items-center gap-2 rounded-sm px-2 py-1.5",
          open && "bg-accent",
          inset && "pl-8",
          className,
        )}
        {...props}
      >
        {children}
        <Icon className="text-foreground ml-auto" size={18} />
      </DropdownMenuPrimitive.SubTrigger>
    </TextClassContext.Provider>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: DropdownMenuPrimitive.SubContentProps & {
  ref?: React.RefObject<DropdownMenuPrimitive.SubContentRef>;
}) {
  const { open } = DropdownMenuPrimitive.useSubContext();
  return (
    <DropdownMenuPrimitive.SubContent
      className={cn(
        "border-border bg-popover shadow-foreground/5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
        open
          ? "web:animate-in web:fade-in-0 web:zoom-in-95"
          : "web:animate-out web:fade-out-0 web:zoom-out",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  overlayClassName,
  overlayStyle,
  portalHost,
  ...props
}: DropdownMenuPrimitive.ContentProps & {
  overlayClassName?: string;
  overlayStyle?: StyleProp<ViewStyle>;
  portalHost?: string;
  ref?: React.RefObject<DropdownMenuPrimitive.ContentRef>;
}) {
  const { open } = DropdownMenuPrimitive.useRootContext();
  return (
    <DropdownMenuPrimitive.Portal hostName={portalHost}>
      <DropdownMenuPrimitive.Overlay
        className={overlayClassName}
        style={
          overlayStyle
            ? StyleSheet.flatten([
                Platform.OS !== "web" ? StyleSheet.absoluteFill : undefined,
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- this is original RNR code
                overlayStyle as typeof StyleSheet.absoluteFill,
              ])
            : Platform.OS !== "web"
              ? StyleSheet.absoluteFill
              : undefined
        }
      >
        <DropdownMenuPrimitive.Content
          className={cn(
            "web:data-[side=bottom]:slide-in-from-top-2 web:data-[side=left]:slide-in-from-right-2 web:data-[side=right]:slide-in-from-left-2 web:data-[side=top]:slide-in-from-bottom-2 border-border bg-popover shadow-foreground/5 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
            open
              ? "web:animate-in web:fade-in-0 web:zoom-in-95"
              : "web:animate-out web:fade-out-0 web:zoom-out-95",
            className,
          )}
          {...props}
        />
      </DropdownMenuPrimitive.Overlay>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  inset,
  ...props
}: DropdownMenuPrimitive.ItemProps & {
  className?: string;
  inset?: boolean;
  ref?: React.RefObject<DropdownMenuPrimitive.ItemRef>;
}) {
  return (
    <TextClassContext.Provider value="select-none text-sm native:text-lg text-popover-foreground web:group-focus:text-accent-foreground">
      <DropdownMenuPrimitive.Item
        className={cn(
          "web:cursor-default native:py-2 web:outline-none web:focus:bg-accent web:hover:bg-accent active:bg-accent group relative flex flex-row items-center gap-2 rounded-sm px-2 py-1.5",
          inset && "pl-8",
          props.disabled && "web:pointer-events-none opacity-50",
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: DropdownMenuPrimitive.CheckboxItemProps & {
  children?: React.ReactNode;
  ref?: React.RefObject<DropdownMenuPrimitive.CheckboxItemRef>;
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "web:cursor-default web:group native:py-2 web:outline-none web:focus:bg-accent active:bg-accent relative flex flex-row items-center rounded-sm py-1.5 pr-2 pl-8",
        props.disabled && "web:pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="text-foreground" size={14} strokeWidth={3} />
        </DropdownMenuPrimitive.ItemIndicator>
      </View>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuPrimitive.RadioItemProps & {
  children?: React.ReactNode;
  ref?: React.RefObject<DropdownMenuPrimitive.RadioItemRef>;
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        "web:cursor-default web:group native:py-2 web:outline-none web:focus:bg-accent active:bg-accent relative flex flex-row items-center rounded-sm py-1.5 pr-2 pl-8",
        props.disabled && "web:pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <View className="bg-foreground h-2 w-2 rounded-full" />
        </DropdownMenuPrimitive.ItemIndicator>
      </View>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuPrimitive.LabelProps & {
  className?: string;
  inset?: boolean;
  ref?: React.RefObject<DropdownMenuPrimitive.LabelRef>;
}) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        "native:text-base web:cursor-default text-foreground px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuPrimitive.SeparatorProps & {
  ref?: React.RefObject<DropdownMenuPrimitive.SeparatorRef>;
}) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn(
        "native:text-sm text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
