"use client";

import { Outlet } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@solved-contact/ui/components/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@solved-contact/ui/components/resizable";
import { Separator } from "@solved-contact/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@solved-contact/ui/components/tabs";
import { TooltipProvider } from "@solved-contact/ui/components/tooltip";

import { type Mail } from "./data";
import { ConversationList } from "./mail-list";

interface ConversationsProps {
  conversations: Mail[];
}

const panelSizeKey = "conversations-layout";

export function Conversations({ conversations }: ConversationsProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- choosing not to validate this with zod since its part of the render path
  const panelSizes: number[] = JSON.parse(
    localStorage.getItem(panelSizeKey) ?? "[30, 70]",
  );

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        className="h-full items-stretch"
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          localStorage.setItem(panelSizeKey, JSON.stringify(sizes));
        }}
      >
        <ResizablePanel defaultSize={panelSizes[0]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Conversations</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  className="text-zinc-600 dark:text-zinc-200"
                  value="all"
                >
                  All chats
                </TabsTrigger>
                <TabsTrigger
                  className="text-zinc-600 dark:text-zinc-200"
                  value="unread"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-4 backdrop-blur">
              <form>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                  <Input className="pl-8" placeholder="Search" />
                </div>
              </form>
            </div>
            <TabsContent className="m-0" value="all">
              <ConversationList items={conversations} />
            </TabsContent>
            <TabsContent className="m-0" value="unread">
              <ConversationList
                items={conversations.filter((item) => !item.read)}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={panelSizes[1]} minSize={30}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
