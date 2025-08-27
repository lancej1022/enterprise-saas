import { Bell, Check, Clock, Settings, X } from "lucide-react";
import { Badge } from "@solved-contact/ui/components/badge";
import { Button } from "@solved-contact/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@solved-contact/ui/components/card";

function getSeverityColor(severity: string) {
  switch (severity) {
    case "high":
      return "destructive";
    case "low":
      return "outline";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
}

export function AlertsPanel() {
  const alerts = [
    {
      id: 1,
      type: "spend_drop",
      title: "Spend Alert",
      message: "Campaign spend dropped below threshold",
      campaign: "Holiday Sale 2024",
      platform: "Google Ads",
      time: "2h ago",
      severity: "high",
    },
    {
      id: 2,
      type: "performance",
      title: "CPC Spike",
      message: "Cost per click increased significantly",
      campaign: "Brand Awareness Q4",
      platform: "Meta Ads",
      time: "4h ago",
      severity: "medium",
    },
    {
      id: 3,
      type: "budget",
      title: "Budget Alert",
      message: "Daily budget 90% consumed",
      campaign: "Lead Generation",
      platform: "LinkedIn Ads",
      time: "6h ago",
      severity: "low",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Active Alerts
          </CardTitle>
          <Button size="sm" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div className="space-y-3 rounded-lg border p-3" key={alert.id}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className="text-xs"
                    variant={getSeverityColor(alert.severity)}
                  >
                    {alert.severity}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {alert.time}
                  </span>
                </div>
                <h4 className="text-sm font-medium">{alert.title}</h4>
                <p className="text-muted-foreground text-xs">{alert.message}</p>
                <div className="text-xs">
                  <span className="text-muted-foreground">Campaign: </span>
                  <span className="font-medium">{alert.campaign}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    • {alert.platform}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="flex-1 gap-1 bg-transparent"
                size="sm"
                variant="outline"
              >
                <Check className="h-3 w-3" />
                Acknowledge
              </Button>
              <Button className="flex-1 gap-1" size="sm" variant="ghost">
                <X className="h-3 w-3" />
                Dismiss
              </Button>
            </div>
          </div>
        ))}

        <Button className="w-full bg-transparent" size="sm" variant="outline">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  );
}
