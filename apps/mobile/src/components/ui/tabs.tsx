import * as React from "react";
import * as TabsPrimitive from "@rn-primitives/tabs";

import { TextClassContext } from "#/components/ui/text";
import { cn } from "#/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: TabsPrimitive.ListProps & {
  ref?: React.RefObject<TabsPrimitive.ListRef>;
}) {
  return (
    <TabsPrimitive.List
      className={cn(
        "web:inline-flex native:h-12 native:px-1.5 bg-muted h-10 items-center justify-center rounded-md p-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.TriggerProps & {
  ref?: React.RefObject<TabsPrimitive.TriggerRef>;
}) {
  const { value } = TabsPrimitive.useRootContext();
  return (
    <TextClassContext.Provider
      value={cn(
        "native:text-base web:transition-all text-muted-foreground text-sm font-medium",
        value === props.value && "text-foreground",
      )}
    >
      <TabsPrimitive.Trigger
        className={cn(
          "web:whitespace-nowrap web:ring-offset-background web:transition-all web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium shadow-none",
          props.disabled && "web:pointer-events-none opacity-50",
          props.value === value &&
            "bg-background shadow-foreground/10 shadow-lg",
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.ContentProps & {
  ref?: React.RefObject<TabsPrimitive.ContentRef>;
}) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
