import { BarChart3, Facebook, Linkedin, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@solved-contact/ui/components/badge";
import { Button } from "@solved-contact/ui/components/button";
import { Card } from "@solved-contact/ui/components/card";

export function DashboardSidebar() {
  const platforms = [
    {
      name: "Google Ads",
      icon: "🔍",
      accounts: 12,
      status: "connected",
      spend: "$45.2K",
    },
    {
      name: "Meta Ads",
      icon: Facebook,
      accounts: 8,
      status: "connected",
      spend: "$32.1K",
    },
    {
      name: "TikTok Ads",
      icon: "🎵",
      accounts: 5,
      status: "connected",
      spend: "$18.7K",
    },
    {
      name: "LinkedIn Ads",
      icon: Linkedin,
      accounts: 3,
      status: "connected",
      spend: "$12.4K",
    },
  ];

  return (
    <aside className="bg-sidebar w-80 space-y-6 border-r p-6">
      <div>
        <h2 className="text-sidebar-foreground mb-4 text-lg font-semibold">
          Connected Platforms
        </h2>
        <div className="space-y-3">
          {platforms.map((platform) => (
            <Card
              className="p-4 transition-shadow hover:shadow-sm"
              key={platform.name}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {typeof platform.icon === "string" ? (
                    <span className="text-lg">{platform.icon}</span>
                  ) : (
                    <platform.icon className="text-primary h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{platform.name}</span>
                </div>
                <Badge className="text-xs" variant="secondary">
                  {platform.status}
                </Badge>
              </div>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{platform.accounts} accounts</span>
                <span className="text-foreground font-medium">
                  {platform.spend}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sidebar-foreground mb-4 text-lg font-semibold">
          Quick Actions
        </h2>
        <div className="space-y-2">
          <Button
            className="w-full justify-start gap-3"
            size="sm"
            variant="ghost"
          >
            <BarChart3 className="h-4 w-4" />
            View All Campaigns
          </Button>
          <Button
            className="w-full justify-start gap-3"
            size="sm"
            variant="ghost"
          >
            <TrendingUp className="h-4 w-4" />
            Performance Report
          </Button>
          <Button
            className="w-full justify-start gap-3"
            size="sm"
            variant="ghost"
          >
            <Zap className="h-4 w-4" />
            Alert Settings
          </Button>
        </div>
      </div>
    </aside>
  );
}
