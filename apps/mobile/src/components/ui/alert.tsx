import * as React from "react";
import { View, type ViewProps } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Text } from "#/components/ui/text";
import { cn } from "#/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react-native";

const alertVariants = cva(
  "relative w-full rounded-lg border border-border bg-background p-4 shadow shadow-foreground/10",
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
      <View className="absolute left-3.5 top-4 -translate-y-0.5">
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
        "mb-1 pl-7 text-base font-medium leading-none tracking-tight text-foreground",
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
      className={cn("pl-7 text-sm leading-relaxed text-foreground", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
