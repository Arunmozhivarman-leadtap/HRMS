import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

interface LeaveBalanceWidgetProps {
  balances: Array<{
    type: string;
    balance: number;
    total: number;
    color: string;
    bg: string;
  }>;
  upcomingLeave?: {
    type: string;
    start_date: string;
    days: number;
    status: string;
  };
  onApplyLeave?: () => void;
}

export function LeaveBalanceWidget({ balances, upcomingLeave }: LeaveBalanceWidgetProps) {
  return (
    <Card className="bg-background border shadow-sm">
      <CardHeader className="pb-4 pt-4 border-b border-border/40">
        <CardTitle className="text-lg font-serif font-medium text-foreground">Leave Balances</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {balances.map((leave) => (
            <div key={leave.type} className="p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors group">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{leave.type}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-serif font-bold text-foreground">{leave.balance}</span>
                <span className="text-xs text-muted-foreground">/ {leave.total}</span>
              </div>
            </div>
          ))}
        </div>

        {upcomingLeave && (
          <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3 flex items-center gap-4">
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-10 h-10 bg-white border shadow-sm rounded-md">
              <span className="text-[8px] uppercase font-bold text-red-500 tracking-wider">
                {format(parseISO(upcomingLeave.start_date), "MMM")}
              </span>
              <span className="text-base font-serif font-bold text-foreground leading-none">
                {format(parseISO(upcomingLeave.start_date), "dd")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">Upcoming: {upcomingLeave.type}</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium bg-green-100 text-green-700">
                  {upcomingLeave.status}
                </span>
                <span className="text-[10px] text-muted-foreground">{upcomingLeave.days} days</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}