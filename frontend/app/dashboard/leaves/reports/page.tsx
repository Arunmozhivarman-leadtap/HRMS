
import { ReportsDashboard } from "@/features/leaves/components/reports-dashboard";
import { cookies } from "next/headers";
import { LeaveBalance } from "@/types/leave";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function getAnalyticsData(year: number) {
    const cookieStore = await cookies();
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`${API_URL}/leaves/analytics?year=${year}`, {
        headers: {
            Cookie: cookieString,
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!res.ok) {
        console.error("Failed to fetch analytics", await res.text());
        // Return empty structure on error to prevent page crash
        return {
            trends: [],
            department_utilization: [],
            type_utilization: [],
            liability: { total_el_days: 0, total_lop_days: 0 },
            top_absentees: []
        };
    }
    return res.json();
}

async function getAllBalances(year: number): Promise<LeaveBalance[]> {
    const cookieStore = await cookies();
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`${API_URL}/leaves/balances/all?year=${year}`, {
        headers: {
            Cookie: cookieString,
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!res.ok) {
        console.error("Failed to fetch all balances", await res.text());
        return [];
    }
    return res.json();
}

export default async function ReportsPage() {
    const currentYear = new Date().getFullYear();
    const analyticsData = await getAnalyticsData(currentYear);

    return (
        <div className="space-y-8">
            {/* Header / Actions Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-serif font-medium text-foreground">Reports & Analytics</h3>
                    <p className="text-sm text-muted-foreground">Detailed insights into leave trends, utilization, and liability.</p>
                </div>
            </div>

            <ReportsDashboard analyticsData={analyticsData} />
        </div>
    );
}
