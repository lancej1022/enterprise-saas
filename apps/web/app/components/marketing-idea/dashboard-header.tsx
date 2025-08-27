import { Bell, Search, Settings } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@solved-contact/ui/components/avatar";
import { Badge } from "@solved-contact/ui/components/badge";
import { Button } from "@solved-contact/ui/components/button";
import { Input } from "@solved-contact/ui/components/input";

export function DashboardHeader() {
  return (
    <header className="bg-card/50 supports-[backdrop-filter]:bg-card/50 border-b backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-primary-foreground text-sm font-bold">
              AI
            </span>
          </div>
          <h1 className="text-foreground text-xl font-bold">
            Campaign Monitor
          </h1>
        </div>

        <div className="mx-4 max-w-md flex-1">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              className="pl-10"
              placeholder="Search campaigns, accounts, or alerts..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className="relative" size="sm" variant="ghost">
            <Bell className="h-4 w-4" />
            <Badge className="bg-destructive absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs">
              3
            </Badge>
          </Button>

          <Button size="sm" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>

          <Avatar className="h-8 w-8">
            <AvatarImage src="/professional-headshot.png" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
