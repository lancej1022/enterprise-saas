import * as React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from "react-native";
import * as ContextMenuPrimitive from "@rn-primitives/context-menu";

import { TextClassContext } from "#/components/ui/text";
import { Check } from "#/lib/icons/check";
import { ChevronDown } from "#/lib/icons/chevron-down";
import { ChevronRight } from "#/lib/icons/chevron-right";
import { ChevronUp } from "#/lib/icons/chevron-up";
import { cn } from "#/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuPrimitive.SubTriggerProps & {
  children?: React.ReactNode;
  inset?: boolean;
  ref?: React.RefObject<ContextMenuPrimitive.SubTriggerRef>;
}) {
  const { open } = ContextMenuPrimitive.useSubContext();
  const Icon =
    Platform.OS === "web" ? ChevronRight : open ? ChevronUp : ChevronDown;
  return (
    <TextClassContext.Provider
      value={cn(
        "native:text-lg text-primary text-sm select-none",
        open && "native:text-accent-foreground",
      )}
    >
      <ContextMenuPrimitive.SubTrigger
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
      </ContextMenuPrimitive.SubTrigger>
    </TextClassContext.Provider>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: ContextMenuPrimitive.SubContentProps & {
  ref?: React.RefObject<ContextMenuPrimitive.SubContentRef>;
}) {
  const { open } = ContextMenuPrimitive.useSubContext();
  return (
    <ContextMenuPrimitive.SubContent
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

function ContextMenuContent({
  className,
  overlayClassName,
  overlayStyle,
  portalHost,
  ...props
}: ContextMenuPrimitive.ContentProps & {
  overlayClassName?: string;
  overlayStyle?: StyleProp<ViewStyle>;
  portalHost?: string;
  ref?: React.RefObject<ContextMenuPrimitive.ContentRef>;
}) {
  const { open } = ContextMenuPrimitive.useRootContext();
  return (
    <ContextMenuPrimitive.Portal hostName={portalHost}>
      <ContextMenuPrimitive.Overlay
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
        <ContextMenuPrimitive.Content
          className={cn(
            "web:data-[side=bottom]:slide-in-from-top-2 web:data-[side=left]:slide-in-from-right-2 web:data-[side=right]:slide-in-from-left-2 web:data-[side=top]:slide-in-from-bottom-2 border-border bg-popover shadow-foreground/5 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
            open
              ? "web:animate-in web:fade-in-0 web:zoom-in-95"
              : "web:animate-out web:fade-out-0 web:zoom-out-95",
            className,
          )}
          {...props}
        />
      </ContextMenuPrimitive.Overlay>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  ...props
}: ContextMenuPrimitive.ItemProps & {
  className?: string;
  inset?: boolean;
  ref?: React.RefObject<ContextMenuPrimitive.ItemRef>;
}) {
  return (
    <TextClassContext.Provider value="select-none text-sm native:text-lg text-popover-foreground web:group-focus:text-accent-foreground">
      <ContextMenuPrimitive.Item
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

function ContextMenuCheckboxItem({
  className,
  children,
  ...props
}: ContextMenuPrimitive.CheckboxItemProps & {
  children?: React.ReactNode;
  ref?: React.RefObject<ContextMenuPrimitive.CheckboxItemRef>;
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      className={cn(
        "web:cursor-default web:group native:py-2 web:outline-none web:focus:bg-accent active:bg-accent relative flex flex-row items-center rounded-sm py-1.5 pr-2 pl-8",
        props.disabled && "web:pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Check className="text-foreground" size={14} strokeWidth={3} />
        </ContextMenuPrimitive.ItemIndicator>
      </View>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: ContextMenuPrimitive.RadioItemProps & {
  children?: React.ReactNode;
  ref?: React.RefObject<ContextMenuPrimitive.RadioItemRef>;
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      className={cn(
        "web:cursor-default web:group native:py-2 web:outline-none web:focus:bg-accent active:bg-accent relative flex flex-row items-center rounded-sm py-1.5 pr-2 pl-8",
        props.disabled && "web:pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <View className="bg-foreground h-2 w-2 rounded-full" />
        </ContextMenuPrimitive.ItemIndicator>
      </View>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuPrimitive.LabelProps & {
  className?: string;
  inset?: boolean;
  ref?: React.RefObject<ContextMenuPrimitive.LabelRef>;
}) {
  return (
    <ContextMenuPrimitive.Label
      className={cn(
        "native:text-base web:cursor-default text-foreground px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuPrimitive.SeparatorProps & {
  ref?: React.RefObject<ContextMenuPrimitive.SeparatorRef>;
}) {
  return (
    <ContextMenuPrimitive.Separator
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({ className, ...props }: TextProps) {
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
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
