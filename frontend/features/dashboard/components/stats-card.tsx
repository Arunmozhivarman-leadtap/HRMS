import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

const getIcon = (name: any): LucideIcon => {
  if (typeof name !== 'string') return name || Icons.Briefcase;
  return (Icons as any)[name] || Icons.Briefcase;
};

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: string | LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accentColor?: string;
}

export default function StatsCard({ title, value, description, icon, trend, trendUp, accentColor = "bg-primary" }: StatsCardProps) {
  const Icon = getIcon(icon);

  return (
    <Card className="bg-background border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Top accent bar */}
      <div className={cn("absolute top-0 left-0 w-full h-1 opacity-80", accentColor)} />

      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-[11px]">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full bg-muted/50 group-hover:bg-muted transition-colors")}>
          <Icon className="h-4 w-4 text-foreground/70" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-serif font-medium text-foreground">{value}</div>
        {(description || trend) && (
          <div className="flex flex-col gap-1 mt-2">
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <p className={cn("text-xs font-medium flex items-center gap-1", trendUp ? "text-green-600" : "text-amber-600")}>
                {trendUp ? "↑" : "!"} {trend}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}