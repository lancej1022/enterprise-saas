import * as React from "react";
import { View } from "react-native";
import type { ViewProps } from "react-native";
import { useTheme } from "@react-navigation/native";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react-native";

import { Text } from "#/components/ui/text";
import { cn } from "#/lib/utils";

const alertVariants = cva(
  "border-border bg-background shadow-foreground/10 relative w-full rounded-lg border p-4 shadow",
  {
    variants: {
      variant: {
        default: "",
        destructive: "border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  children,
  icon: Icon,
  iconSize = 16,
  iconClassName,
  ...props
}: ViewProps &
  VariantProps<typeof alertVariants> & {
    icon: LucideIcon;
    iconClassName?: string;
    iconSize?: number;
    ref?: React.RefObject<View>;
  }) {
  const { colors } = useTheme();
  return (
    <View
      className={alertVariants({ variant, className })}
      role="alert"
      {...props}
    >
      <View className="absolute top-4 left-3.5 -translate-y-0.5">
        <Icon
          color={variant === "destructive" ? colors.notification : colors.text}
          size={iconSize}
        />
      </View>
      {children}
    </View>
  );
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "text-foreground mb-1 pl-7 text-base leading-none font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn("text-foreground pl-7 text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
