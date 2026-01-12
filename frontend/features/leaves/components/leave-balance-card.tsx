import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveBalance } from "@/types/leave";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LeaveBalanceCardProps {
    balances?: LeaveBalance[];
    isLoading: boolean;
}

export function LeaveBalanceCard({ balances, isLoading }: LeaveBalanceCardProps) {
    if (isLoading) {
        return <LeaveBalanceSkeleton />;
    }

    if (!balances || balances.length === 0) {
        return (
            <div className="col-span-full">
                <Card className="bg-background border shadow-sm">
                    <CardContent className="py-10 text-center">
                        <p className="text-sm text-muted-foreground">No leave balance information available.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const sortedBalances = [...balances].sort((a, b) => {
        const order: Record<string, number> = { 'earned_leave': 1, 'casual_leave': 2, 'sick_leave': 3 };
        const orderA = order[a.leave_type.name] || 99;
        const orderB = order[b.leave_type.name] || 99;
        return orderA - orderB;
    });

    const getLeaveStyle = (name: string) => {
        if (name === 'earned_leave') return { color: "bg-red-500", bg: "bg-red-50", text: "text-red-600", border: "border-red-100" };
        if (name === 'casual_leave') return { color: "bg-orange-400", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" };
        if (name === 'sick_leave') return { color: "bg-slate-500", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" };
        return { color: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" };
    };

    return (
        <>
            {sortedBalances.map((balance) => {
                const max = balance.leave_type.annual_entitlement + balance.carry_forward;
                const percentage = Math.min(100, Math.max(0, (balance.available / (max || 1)) * 100));
                const style = getLeaveStyle(balance.leave_type.name);

                return (
                    <Card key={balance.id} className="bg-background border shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        {/* Top accent bar */}
                        <div className={cn("absolute top-0 left-0 w-full h-1 opacity-80", style.color)} />
                        
                        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                            <CardTitle className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
                                {balance.leave_type.abbr} - {balance.leave_type.name.replace(/_/g, ' ')}
                            </CardTitle>
                            <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold", style.bg, style.text, style.border, "border")}>
                                {Math.round(percentage)}%
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-serif font-medium text-foreground">{balance.available}</span>
                                <span className="text-sm text-muted-foreground">/ {max} days</span>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full transition-all duration-1000 ease-out", style.color)}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                    <span>Available</span>
                                    <span>{balance.taken} Taken</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </>
    );
}

function LeaveBalanceSkeleton() {
    return (
        <>
            {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-background border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-10" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16 mb-4" />
                        <Skeleton className="h-1.5 w-full rounded-full" />
                        <div className="flex justify-between mt-2">
                            <Skeleton className="h-2 w-10" />
                            <Skeleton className="h-2 w-10" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}
