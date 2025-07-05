"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// eslint-disable-next-line func-style -- TODO: this is straight from shadcn
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      className="toaster group"
      style={
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: this is straight from shadcn
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: this is straight from shadcn
      theme={theme as ToasterProps["theme"]}
      {...props}
    />
  );
};

export { Toaster };
