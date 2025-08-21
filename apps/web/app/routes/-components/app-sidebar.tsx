"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Inbox,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@solved-contact/ui/components/sidebar";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

// This is sample data.
const data = {
  teams: [
    {
      name: "Solved Contact",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    // TODO: Need to import the router or something and use `satisfies + `as const` in order to make the urls type safe
    {
      title: "Admin",
      url: "/admin", // TODO: dont think this URL is actually used anywhere?
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Users",
          url: "/admin/users",
        },
        {
          title: "Teams",
          url: "/admin/teams",
        },
        {
          title: "Organization Settings",
          url: "/admin/organization-settings",
        },
      ],
    },
    {
      title: "Inbox",
      url: "/inbox",
      icon: Inbox,
      items: [
        {
          title: "All",
          url: "/inbox",
        },
        {
          title: "@Mentions",
          url: "/inbox?mentions",
        },
        {
          title: "Created by you",
          url: "/inbox?created-by-you",
        },
        {
          title: "Unassigned",
          url: "/inbox?unassigned",
        },
        {
          title: "Dashboard",
          url: "/inbox/unassigned",
        },
        {
          title: "Team Inboxes",
          url: "/inbox/team",
        },
        {
          title: "AI Agent",
          url: "/inbox/ai-agent",
        },
      ],
    },
    {
      title: "User Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <nav>
          <NavMain items={data.navMain} />
          <NavProjects projects={data.projects} />
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
