import * as React from "react";
import { Text, View } from "react-native";
import type { TextProps, ViewProps } from "react-native";

import { TextClassContext } from "#/components/ui/text";
import { cn } from "#/lib/utils";

function Card({
  className,
  ...props
}: ViewProps & {
  ref?: React.RefObject<View>;
}) {
  return (
    <View
      className={cn(
        "border-border bg-card shadow-foreground/10 rounded-lg border shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({
  className,
  ...props
}: ViewProps & {
  ref?: React.RefObject<View>;
}) {
  return (
    <View
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: TextProps & {
  ref?: React.RefObject<Text>;
}) {
  return (
    <Text
      aria-level={3}
      className={cn(
        "text-card-foreground text-2xl leading-none font-semibold tracking-tight",
        className,
      )}
      role="heading"
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: TextProps & {
  ref?: React.RefObject<Text>;
}) {
  return (
    <Text
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: ViewProps & {
  ref?: React.RefObject<View>;
}) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View className={cn("p-6 pt-0", className)} {...props} />
    </TextClassContext.Provider>
  );
}

function CardFooter({
  className,
  ...props
}: ViewProps & {
  ref?: React.RefObject<View>;
}) {
  return (
    <View
      className={cn("flex flex-row items-center p-6 pt-0", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
