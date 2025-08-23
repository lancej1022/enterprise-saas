"use client";

import { useLayoutEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
  const matches = useRouterState({ select: (s) => s.matches });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  /*
    Because the route change can be triggered from anywhere in the app, not just
    from the sidebar, I think we have to rely on an effect that fires whenever the routes update.
  */
  useLayoutEffect(() => {
    const currentPathname = matches[2]?.pathname;
    const newOpenSections: Record<string, boolean> = {};

    for (const item of items) {
      const isActive = currentPathname?.startsWith(
        `/${item.title.toLowerCase()}`,
      );
      newOpenSections[item.title] = isActive || false;
    }

    setOpenSections(newOpenSections);
  }, [matches, items]);

  function updateOpenSections(itemTitle: string) {
    setOpenSections((prev) => ({
      ...prev,
      [itemTitle]: !prev[itemTitle],
    }));
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
                          <Link to={subItem.url}>
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
