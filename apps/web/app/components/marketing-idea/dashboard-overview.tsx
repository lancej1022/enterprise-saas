import {
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@solved-contact/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@solved-contact/ui/components/card";

export function DashboardOverview() {
  const metrics = [
    {
      title: "Total Ad Spend",
      value: "$108.4K",
      change: "+12.5%",
      trend: "up",
      period: "vs last month",
    },
    {
      title: "Active Campaigns",
      value: "247",
      change: "+8",
      trend: "up",
      period: "this week",
    },
    {
      title: "Avg. ROAS",
      value: "4.2x",
      change: "-0.3x",
      trend: "down",
      period: "vs last month",
    },
    {
      title: "Account Health",
      value: "92%",
      change: "+5%",
      trend: "up",
      period: "overall score",
    },
  ];

  const alerts = [
    { type: "critical", count: 2, label: "Critical" },
    { type: "warning", count: 5, label: "Warning" },
    { type: "info", count: 12, label: "Info" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-balance">Campaign Overview</h2>
        <div className="flex items-center gap-2">
          {alerts.map((alert) => (
            <Badge
              className="gap-1"
              key={alert.type}
              variant={
                alert.type === "critical"
                  ? "destructive"
                  : alert.type === "warning"
                    ? "secondary"
                    : "outline"
              }
            >
              {alert.type === "critical" && (
                <AlertTriangle className="h-3 w-3" />
              )}
              {alert.type === "warning" && (
                <AlertTriangle className="h-3 w-3" />
              )}
              {alert.type === "info" && <CheckCircle className="h-3 w-3" />}
              {alert.count} {alert.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            className="transition-shadow hover:shadow-sm"
            key={metric.title}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metric.value}</span>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    metric.trend === "up" ? "text-primary" : "text-destructive"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {metric.change}
                </div>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {metric.period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
