import {
  AlertTriangle,
  Clock,
  ExternalLink,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@solved-contact/ui/components/badge";
import { Button } from "@solved-contact/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@solved-contact/ui/components/card";

function getStatusColor(status: string) {
  switch (status) {
    case "acknowledged":
      return "bg-secondary/10 text-secondary-foreground";
    case "resolved":
      return "bg-primary/10 text-primary";
    case "unresolved":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "destructive";
    case "info":
      return "outline";
    case "warning":
      return "secondary";
    default:
      return "outline";
  }
}

const anomalies = [
  {
    id: 1,
    severity: "critical",
    title: "Spend Drop Detected",
    description:
      'Google Ads campaign "Holiday Sale 2024" spend dropped 85% in last 4 hours',
    platform: "Google Ads",
    campaign: "Holiday Sale 2024",
    metric: "Spend",
    change: "-85%",
    timeAgo: "2 hours ago",
    status: "unresolved",
  },
  {
    id: 2,
    severity: "warning",
    title: "CPC Spike Alert",
    description:
      'Meta campaign "Brand Awareness Q4" CPC increased 45% above normal range',
    platform: "Meta Ads",
    campaign: "Brand Awareness Q4",
    metric: "CPC",
    change: "+45%",
    timeAgo: "4 hours ago",
    status: "acknowledged",
  },
  {
    id: 3,
    severity: "info",
    title: "Performance Improvement",
    description:
      'LinkedIn campaign "B2B Lead Gen" ROAS improved 23% after recent optimizations',
    platform: "LinkedIn Ads",
    campaign: "B2B Lead Gen",
    metric: "ROAS",
    change: "+23%",
    timeAgo: "6 hours ago",
    status: "resolved",
  },
  {
    id: 4,
    severity: "warning",
    title: "Budget Utilization Low",
    description:
      'TikTok campaign "Gen Z Targeting" using only 32% of daily budget',
    platform: "TikTok Ads",
    campaign: "Gen Z Targeting",
    metric: "Budget Usage",
    change: "-68%",
    timeAgo: "8 hours ago",
    status: "unresolved",
  },
];
export function AnomalyFeed() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Anomaly Feed</CardTitle>
          <Button size="sm" variant="outline">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {anomalies.map((anomaly) => (
          <div
            className="rounded-lg border p-4 transition-shadow hover:shadow-sm"
            key={anomaly.id}
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  className="gap-1"
                  variant={getSeverityColor(anomaly.severity)}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {anomaly.severity}
                </Badge>
                <Badge
                  className={getStatusColor(anomaly.status)}
                  variant="outline"
                >
                  {anomaly.status}
                </Badge>
              </div>
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {anomaly.timeAgo}
              </div>
            </div>

            <h3 className="mb-1 text-sm font-semibold">{anomaly.title}</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              {anomaly.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">Platform:</span>
                <span className="font-medium">{anomaly.platform}</span>
                <span className="text-muted-foreground">Campaign:</span>
                <span className="font-medium">{anomaly.campaign}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    anomaly.change.startsWith("+")
                      ? "text-primary"
                      : "text-destructive"
                  }`}
                >
                  {anomaly.change.startsWith("+") ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {anomaly.change}
                </div>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
