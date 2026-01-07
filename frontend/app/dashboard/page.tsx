import { StatsCard } from "@/features/dashboard/components/stats-card";
import { LeaveBalanceWidget } from "@/features/dashboard/components/leave-balance-widget";
import { CelebrationsWidget } from "@/features/dashboard/components/celebrations-widget";
import { Users, CalendarClock, Briefcase, FileCheck } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="relative">
      {/* Background Accents (Subtle geometric grid) */}
      <div className="absolute top-[-40px] right-[-20px] -z-10 opacity-20 pointer-events-none select-none">
          <div className="grid grid-cols-4 grid-rows-4 gap-1">
             <div className="w-16 h-16 bg-red-100/50 rounded-sm"></div>
             <div className="w-16 h-16 bg-orange-100/50 rounded-sm"></div>
             <div className="w-16 h-16 bg-transparent"></div>
             <div className="w-16 h-16 bg-red-50/50 rounded-sm"></div>
             
             <div className="w-16 h-16 bg-transparent"></div>
             <div className="w-16 h-16 bg-red-100/30 rounded-sm"></div>
             <div className="w-16 h-16 bg-orange-50/50 rounded-sm"></div>
             <div className="w-16 h-16 bg-transparent"></div>
          </div>
      </div>

      <div className="flex flex-col gap-3 mb-12 relative">
        <h2 className="text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground">
          Good morning, Rahul
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Here is your daily overview. You have <span className="text-foreground font-medium underline decoration-red-200 underline-offset-4">3 items</span> requiring attention today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Employees"
          value="45"
          description="Active Employees"
          icon={Users}
          trend="+2 this month"
          trendUp={true}
          accentColor="bg-blue-500"
        />
        <StatsCard
          title="On Leave Today"
          value="3"
          description="Rahul, Priya +1 more"
          icon={CalendarClock}
          accentColor="bg-orange-500"
        />
        <StatsCard
          title="Open Positions"
          value="7"
          description="Across 3 departments"
          icon={Briefcase}
          accentColor="bg-red-500"
        />
        <StatsCard
          title="Pending Documents"
          value="12"
          description="Requires verification"
          icon={FileCheck}
          trend="Action needed"
          trendUp={false}
          accentColor="bg-purple-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
           <LeaveBalanceWidget />
        </div>
        <div className="col-span-3">
           <CelebrationsWidget />
        </div>
      </div>
    </div>
  );
}