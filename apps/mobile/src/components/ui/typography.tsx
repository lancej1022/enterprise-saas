import * as React from "react";
import { Platform, Text as RNText } from "react-native";
import * as Slot from "@rn-primitives/slot";

import { cn } from "#/lib/utils";

type TypographyProps = React.ComponentProps<typeof RNText> & {
  asChild?: boolean;
  ref?: React.RefObject<RNText>;
};

function H1({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      aria-level="1"
      className={cn(
        "web:scroll-m-20 web:select-text text-foreground text-4xl font-extrabold tracking-tight lg:text-5xl",
        className,
      )}
      role="heading"
      {...props}
    />
  );
}

function H2({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      aria-level="2"
      className={cn(
        "web:scroll-m-20 web:select-text border-border text-foreground border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      role="heading"
      {...props}
    />
  );
}

function H3({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      aria-level="3"
      className={cn(
        "web:scroll-m-20 web:select-text text-foreground text-2xl font-semibold tracking-tight",
        className,
      )}
      role="heading"
      {...props}
    />
  );
}

function H4({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      aria-level="4"
      className={cn(
        "web:scroll-m-20 web:select-text text-foreground text-xl font-semibold tracking-tight",
        className,
      )}
      role="heading"
      {...props}
    />
  );
}

function P({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn("web:select-text text-foreground text-base", className)}
      {...props}
    />
  );
}

function BlockQuote({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn(
        "native:mt-4 native:pl-3 web:select-text border-border text-foreground mt-6 border-l-2 pl-6 text-base italic",
        className,
      )}
      // @ts-expect-error - role of blockquote renders blockquote element on the web
      role={Platform.OS === "web" ? "blockquote" : undefined}
      {...props}
    />
  );
}

function Code({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn(
        "web:select-text bg-muted text-foreground relative rounded-md px-[0.3rem] py-[0.2rem] text-sm font-semibold",
        className,
      )}
      // @ts-expect-error - role of code renders code element on the web
      role={Platform.OS === "web" ? "code" : undefined}
      {...props}
    />
  );
}

function Lead({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn("web:select-text text-muted-foreground text-xl", className)}
      {...props}
    />
  );
}

function Large({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn(
        "web:select-text text-foreground text-xl font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function Small({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn(
        "web:select-text text-foreground text-sm leading-none font-medium",
        className,
      )}
      {...props}
    />
  );
}

function Muted({ className, asChild = false, ...props }: TypographyProps) {
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn("web:select-text text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export { BlockQuote, Code, H1, H2, H3, H4, Large, Lead, Muted, P, Small };
