"use client"

import { NotificationsWidget } from "@/features/dashboard/components/notifications-widget";
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard";
import {
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import StatsCard from "@/features/dashboard/components/stats-card";
import { ApplyLeaveDialog } from "@/features/leaves/components/apply-leave-dialog";

const getActionIcon = (name: string) => {
  return (Icons as any)[name] || Icons.Plus;
};

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-sm">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="relative pb-10">
      <div className="flex flex-col gap-3 mb-12 relative">
        <h2 className="text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground">
          {data.greeting}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Here is your daily overview. You have specialized tasks and team updates waiting for you.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-14">
        {data.stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
            trendUp={stat.trendUp}
            accentColor={stat.accentColor}
          />
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-10">
          {/* Quick Actions */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {data.quick_actions.map((action, idx) => {
                const Icon = getActionIcon(action.icon);

                const content = (
                  <Card className="hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
                        <Icon className="h-5 w-5 text-zinc-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{action.title}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </CardContent>
                  </Card>
                );

                if (action.action === "apply_leave") {
                  return (
                    <ApplyLeaveDialog
                      key={idx}
                      trigger={content}
                    />
                  );
                }

                return (
                  <Link key={idx} href={action.link || "#"}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <NotificationsWidget />

        </div>
      </div>
    </div>
  );
}