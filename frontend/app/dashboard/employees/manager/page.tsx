"use client";

import { useEmployees } from "@/hooks/use-employee";
import { TeamEmployeeTable } from "@/components/employees/team-employee-table";
import { TeamSummaryCards } from "@/components/employees/team-summary-cards";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Users } from "lucide-react";

export default function ManagerTeamPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useEmployees({ search });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">Team Overview</h3>
          <p className="text-sm text-muted-foreground">Monitor your team's performance and details.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members by name or code..."
              className="pl-10 h-11 bg-background border-border/60 focus:ring-primary/20 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            <TeamSummaryCards employees={data?.items || []} />
            <TeamEmployeeTable employees={data?.items || []} />
          </div>
        )}
      </div>
    </div>
  );
}
