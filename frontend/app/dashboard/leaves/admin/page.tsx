"use client"

import Link from "next/link"
import { useAllLeaveApplications, usePendingApprovals, usePendingCreditRequests } from "@/features/leaves/hooks/use-leaves"
import { PendingApprovals } from "@/features/leaves/components/pending-approvals"
import { CreditApprovals } from "@/features/leaves/components/credit-approvals"
import { LeaveHistoryTable } from "@/features/leaves/components/leave-history-table"
import { LeaveUsageChart } from "@/features/leaves/components/leave-usage-chart"
import { HolidayConfig } from "@/features/leaves/components/holiday-config"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, ShieldCheck, CreditCard } from "lucide-react"

import { usePagination } from "@/hooks/use-pagination"

export default function AdminLeavesPage() {
    const historyPagination = usePagination(10)

    const { data: allApplications, isLoading: isLoadingAllApps } = useAllLeaveApplications({
        skip: historyPagination.skip,
        limit: historyPagination.limit,
        search: historyPagination.search
    })

    const { data: pendingApprovals } = usePendingApprovals()
    const { data: pendingCredits } = usePendingCreditRequests()

    const stats = [
        {
            title: "Total Applications",
            value: allApplications?.total || "0",
            icon: Globe,
            description: "Current year total",
            color: "text-zinc-600",
            bg: "bg-zinc-100"
        },
        {
            title: "Global Pending",
            value: pendingApprovals?.total || "0",
            icon: ShieldCheck,
            description: "Awaiting approval",
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "Compliance",
            value: "100%",
            icon: ShieldCheck,
            description: "Policy adherence",
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">Organization Leave Control</h3>
                    <p className="text-sm text-muted-foreground">Global overview of attendance and leave policy compliance.</p>
                </div>
                <Button asChild variant="outline" className="rounded-full font-bold border-zinc-200">
                    <Link href="/dashboard/settings/leaves">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Policy Settings
                    </Link>
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-none shadow-sm bg-background">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-serif font-medium">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="app-queue" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px] mb-8">
                    <TabsTrigger value="app-queue" className="relative font-bold">
                        Queue
                        {pendingApprovals && pendingApprovals.total > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 border-none px-1.5 h-4 min-w-4 flex items-center justify-center rounded-full text-[10px] font-bold">
                                {pendingApprovals.total}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="credit-requests" className="relative font-bold">
                        Credits
                        {pendingCredits && pendingCredits.total > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-zinc-100 text-zinc-700 border-none px-1.5 h-4 min-w-4 flex items-center justify-center rounded-full text-[10px] font-bold">
                                {pendingCredits.total}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="all-history" className="font-bold">History</TabsTrigger>
                    <TabsTrigger value="holidays" className="font-bold">Holidays</TabsTrigger>
                </TabsList>

                <TabsContent value="app-queue" className="mt-0">
                    <PendingApprovals />
                </TabsContent>

                <TabsContent value="credit-requests" className="mt-0">
                    <CreditApprovals />
                </TabsContent>

                <TabsContent value="all-history" className="mt-0">
                    <LeaveHistoryTable
                        data={allApplications?.items || []}
                        totalCount={allApplications?.total || 0}
                        pageSize={historyPagination.pageSize}
                        pageIndex={historyPagination.pageIndex}
                        onPageChange={historyPagination.onPageChange}
                        onPageSizeChange={historyPagination.onPageSizeChange}
                        onSearch={historyPagination.onSearch}
                        isLoading={isLoadingAllApps}
                        variant="admin"
                    />
                </TabsContent>

                <TabsContent value="holidays" className="mt-0">
                    <Card className="border-border/40 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <HolidayConfig />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}