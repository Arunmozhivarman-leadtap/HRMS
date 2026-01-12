"use client"

import Link from "next/link"
import { useAllLeaveApplications, usePendingApprovals } from "@/features/leaves/hooks/use-leaves"
import { PendingApprovals } from "@/features/leaves/components/pending-approvals"
import { LeaveHistoryTable } from "@/features/leaves/components/leave-history-table"
import { LeaveUsageChart } from "@/features/leaves/components/leave-usage-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, ShieldCheck } from "lucide-react"

export default function AdminLeavesPage() {
    const { data: allApplications, isLoading: isLoadingAllApps } = useAllLeaveApplications()
    const { data: pendingApprovals } = usePendingApprovals()

    const stats = [
        {
            title: "Total Applications",
            value: allApplications?.length || "0",
            icon: Globe,
            description: "Current year total",
            color: "text-zinc-600",
            bg: "bg-zinc-100"
        },
        {
            title: "Global Pending",
            value: pendingApprovals?.length || "0",
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

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <PendingApprovals />
                </div>
                <div className="lg:col-span-4">
                    <LeaveUsageChart />
                </div>
            </div>

            <Tabs defaultValue="all-history" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="all-history">All Leave History</TabsTrigger>
                        <TabsTrigger value="policies">Policies Summary</TabsTrigger>
                    </TabsList>
                </div>
                
                <TabsContent value="all-history" className="mt-0">
                    <LeaveHistoryTable 
                        applications={allApplications} 
                        isLoading={isLoadingAllApps} 
                        variant="admin" 
                    />
                </TabsContent>
                
                <TabsContent value="policies" className="mt-0 text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                    <p className="text-sm text-muted-foreground">Configurable leave policies overview coming soon.</p>
                </TabsContent>
            </Tabs>
        </div>
    )
}