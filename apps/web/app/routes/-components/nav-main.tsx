"use client";

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { z } from "zod/v4";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@solved-contact/web-ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@solved-contact/web-ui/components/sidebar";

const STORAGE_KEY = "nav-main-open-sections";

const openSectionsSchema = z.record(z.string(), z.boolean());

function getStoredOpenSections(): Record<string, boolean> {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    const result = openSectionsSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    return {};
  } catch {
    return {};
  }
}

function saveOpenSections(sections: Record<string, boolean>) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  } catch {
    console.error(
      "Failed to save open sections to localStorage during `saveOpenSections`",
    );
  }
}

export function NavMain({
  items,
}: {
  items: {
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
    title: string;
    url: string;
  }[];
}) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => getStoredOpenSections(),
  );

  function updateOpenSections(itemTitle: string) {
    setOpenSections((prev) => {
      const newSections = {
        ...prev,
        [itemTitle]: !prev[itemTitle],
      };
      saveOpenSections(newSections);
      return newSections;
    });
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isOpen = openSections[item.title] || false;

          return (
            <Collapsible
              asChild
              className="group/collapsible"
              key={item.title}
              onOpenChange={() => updateOpenSections(item.title)}
              open={isOpen}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            activeProps={{
                              className:
                                "dark:not-hover:text-[#00bfff] not-hover:text-primary",
                            }}
                            to={subItem.url}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
