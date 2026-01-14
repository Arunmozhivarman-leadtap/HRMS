import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";

export interface DashboardData {
    greeting: string;
    stats: Array<{
        title: string;
        value: string;
        description?: string;
        trend?: string;
        trendUp?: boolean;
        accentColor: string;
        icon: string;
    }>;
    celebrations: Array<{
        employee_id: number;
        name: string;
        type: "birthday" | "anniversary";
        date: string;
        years?: number;
        avatar?: string;
        initials: string;
    }>;
    leave_balances?: Array<{
        type: string;
        balance: number;
        total: number;
        color: string;
        bg: string;
    }>;
    upcoming_leave?: {
        type: string;
        start_date: string;
        days: number;
        status: string;
    };
    quick_actions: Array<{
        title: string;
        icon: string;
        link?: string;
        action?: string;
    }>;
}

export function useDashboardData() {
    return useQuery<DashboardData>({
        queryKey: ["dashboard-data"],
        queryFn: () => fetcher("/dashboard"),
    });
}
