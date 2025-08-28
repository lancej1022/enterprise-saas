# AGENTS.md - Web UI Components

Shared component library based on shadcn/ui for consistent design across web apps in the monorepo.

## Architecture Overview

### Design System Foundation

- **Radix UI**: Unstyled, accessible primitives
- **shadcn/ui**: Pre-built components with Tailwind CSS
- **Tailwind CSS v4**: Utility-first styling
- **Class Variance Authority**: Component variants
- **Lucide React**: Consistent icon library

## Accessibility Guidelines

### ARIA Standards

All components must meet WCAG 2.1 AA standards.
Ensure all interactive elements support keyboard navigation:

## Responsive Design

### Mobile-First Approach

Design components to work on all screen sizes:

```typescript
// Responsive utilities
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState("sm");

  useEffect(() => {
    const updateBreakpoint = () => {
      if (window.innerWidth >= 1024) setBreakpoint("lg");
      else if (window.innerWidth >= 768) setBreakpoint("md");
      else setBreakpoint("sm");
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
};

// Responsive component variants
const dialogVariants = cva(
  "bg-background fixed z-50 grid w-full gap-4 border p-6 shadow-lg duration-200",
  {
    variants: {
      size: {
        sm: "max-w-sm",

        default: "max-w-lg",
        lg: "max-w-4xl",
        full: "m-0 h-full max-w-none",
      },
    },
  },
);
```

Remember: This component library is shared across web and potentially other platforms. Maintain consistency, accessibility, and performance as top priorities.
