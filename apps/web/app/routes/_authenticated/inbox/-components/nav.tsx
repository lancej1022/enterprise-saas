"use client";

import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { buttonVariants } from "@solved-contact/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@solved-contact/ui/components/tooltip";
import { cn } from "@solved-contact/ui/lib/utils";

interface NavProps {
  isCollapsed: boolean;
  links: {
    icon: LucideIcon;
    label?: string;
    title: string;
    variant: "default" | "ghost";
  }[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  return (
    <div
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
      data-collapsed={isCollapsed}
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip delayDuration={0} key={index}>
              <TooltipTrigger asChild>
                <Link
                  className={cn(
                    buttonVariants({ variant: link.variant, size: "icon" }),
                    "h-9 w-9",
                    link.variant === "default" &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
                  )}
                  to="/inbox"
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="flex items-center gap-4" side="right">
                {link.title}
                {link.label && (
                  <span className="text-muted-foreground ml-auto">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              className={cn(
                buttonVariants({ variant: link.variant, size: "sm" }),
                link.variant === "default" &&
                  "dark:bg-muted dark:hover:bg-muted dark:text-white dark:hover:text-white",
                "justify-start",
              )}
              key={index}
              to="/inbox"
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    "ml-auto",
                    link.variant === "default" &&
                      "text-background dark:text-white",
                  )}
                >
                  {link.label}
                </span>
              )}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
