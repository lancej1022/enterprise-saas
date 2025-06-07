import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: this is straight from shadcn
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: this is straight from shadcn
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
