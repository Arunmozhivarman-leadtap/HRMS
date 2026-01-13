"use client";

import { Employee } from "@/types/employee";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserCheck, Activity } from "lucide-react";

interface TeamSummaryCardsProps {
  employees: Employee[];
}

export function TeamSummaryCards({ employees }: TeamSummaryCardsProps) {
  const totalMembers = employees.length;
  const activeMembers = employees.filter(e => e.employment_status === "active").length;
  const newJoiners = employees.filter(e => {
    if (!e.date_of_joining) return false;
    const joiningDate = new Date(e.date_of_joining);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joiningDate > thirtyDaysAgo;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-background border shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Team</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-serif font-medium">{totalMembers}</div>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">Reporting hierarchy</p>
        </CardContent>
      </Card>

      <Card className="bg-background border shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Now</CardTitle>
          <UserCheck className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-serif font-medium">{activeMembers}</div>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">On roll</p>
        </CardContent>
      </Card>

      <Card className="bg-background border shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Joiners</CardTitle>
          <UserPlus className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-serif font-medium text-foreground">{newJoiners}</div>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">Last 30 days</p>
        </CardContent>
      </Card>

      <Card className="bg-background border shadow-sm rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">On Notice</CardTitle>
          <Activity className="h-4 w-4 text-rose-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-serif font-medium text-foreground">
            {employees.filter(e => e.employment_status === "notice").length}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">Exits in progress</p>
        </CardContent>
      </Card>
    </div>
  );
}
