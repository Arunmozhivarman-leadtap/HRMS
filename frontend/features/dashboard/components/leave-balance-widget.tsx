import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LeaveBalanceWidget() {
  const leaves = [
    { type: "Earned Leave", balance: 12.5, total: 15, color: "bg-red-500", bg: "bg-red-100" },
    { type: "Casual Leave", balance: 8, total: 12, color: "bg-orange-400", bg: "bg-orange-100" },
    { type: "Sick Leave", balance: 10, total: 12, color: "bg-slate-500", bg: "bg-slate-100" },
  ];

  return (
    <Card className="bg-background border shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/40">
        <CardTitle className="text-xl font-serif font-medium text-foreground">Leave Balance</CardTitle>
        <Button variant="outline" size="sm" className="h-8 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
            + Apply Leave
        </Button>
      </CardHeader>
      <CardContent className="grid gap-8 pt-6">
        <div className="space-y-6">
            {leaves.map((leave) => (
            <div key={leave.type} className="space-y-3">
                <div className="flex items-end justify-between text-sm">
                <span className="font-medium text-foreground/90">{leave.type}</span>
                <span className="text-muted-foreground text-xs">
                    <span className="font-semibold text-foreground text-sm">{leave.balance}</span> / {leave.total} days
                </span>
                </div>
                <div className={`h-2.5 w-full overflow-hidden rounded-full ${leave.bg}`}>
                <div
                    className={`h-full ${leave.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${(leave.balance / leave.total) * 100}%` }}
                />
                </div>
            </div>
            ))}
        </div>
        
        <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-4 flex items-center gap-4">
             <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 bg-white border shadow-sm rounded-md">
                 <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider">Jan</span>
                 <span className="text-lg font-serif font-bold text-foreground leading-none">15</span>
             </div>
             <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-foreground truncate">Upcoming: Earned Leave</p>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                        Approved
                    </span>
                    <span className="text-xs text-muted-foreground">3 days</span>
                 </div>
             </div>
             <Button variant="ghost" size="sm" className="text-xs h-8">View</Button>
        </div>
      </CardContent>
    </Card>
  );
}