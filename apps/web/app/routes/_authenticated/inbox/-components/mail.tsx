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
import { MailList } from "./mail-list";

interface MailProps {
  defaultCollapsed?: boolean;
  defaultLayout: number[] | undefined;
  mails: Mail[];
  navCollapsedSize: number;
}

export function Mail({
  mails,
  defaultLayout = [12, 88], //[20, 32, 48],
}: MailProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        className="h-full items-stretch"
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
            sizes,
          )}`;
        }}
      >
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[0]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  className="text-zinc-600 dark:text-zinc-200"
                  value="all"
                >
                  All mail
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
              <MailList items={mails} />
            </TabsContent>
            <TabsContent className="m-0" value="unread">
              <MailList items={mails.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
