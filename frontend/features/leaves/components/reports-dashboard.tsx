
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendChart } from "./charts/trend-chart"
import { DepartmentChart, LeaveTypeChart } from "./charts/utilization-charts"
import { LiabilityCard } from "./cards/liability-card"
import { BalanceReportTable } from "./tables/balance-report-table"
import { LeaveBalance } from "@/types/leave"

interface ReportsDashboardProps {
    analyticsData: {
        trends: { month: number; days: number }[]
        department_utilization: { department: string; days: number }[]
        type_utilization: { type: string; days: number }[]
        liability: { total_el_days: number, total_lop_days: number }
        top_absentees: { name: string; days: number }[]
    }
}

export function ReportsDashboard({ analyticsData }: ReportsDashboardProps) {
    return (
        <div className="space-y-8">
            {/* Top Cards Section - Summary Stats */}
            <LiabilityCard data={analyticsData.liability} />

            {/* Main Tabs Section */}
            <div className="w-full">
                <Tabs defaultValue="overview" className="w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <TabsList>
                            <TabsTrigger value="overview">Analytics Overview</TabsTrigger>
                            <TabsTrigger value="balances">Employee Balances</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-6 mt-0">
                        {/* 1. Trend Chart - Full Width */}
                        <div className="w-full">
                            <TrendChart data={analyticsData.trends} />
                        </div>

                        {/* 2. Utilization Charts - Side by Side (Half Width) */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <DepartmentChart data={analyticsData.department_utilization} />
                            <LeaveTypeChart data={analyticsData.type_utilization} />
                        </div>
                    </TabsContent>

                    <TabsContent value="balances" className="mt-0">
                        <BalanceReportTable />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
