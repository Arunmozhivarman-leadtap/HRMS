"use client"

import { usePendingApprovals, useTeamLeaveApplications, usePendingCreditRequests } from "@/features/leaves/hooks/use-leaves"
import { PendingApprovals } from "@/features/leaves/components/pending-approvals"
import { CreditApprovals } from "@/features/leaves/components/credit-approvals"
import { LeaveHistoryTable } from "@/features/leaves/components/leave-history-table"
import { TeamLeaveCalendar } from "@/features/leaves/components/team-leave-calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CalendarCheck, Clock } from "lucide-react"

export default function ManagerLeavesPage() {
    const { data: teamApplications, isLoading: isLoadingTeamApps } = useTeamLeaveApplications()
    const { data: pendingApprovals } = usePendingApprovals()
    const { data: pendingCredits } = usePendingCreditRequests()

    const stats = [
        {
            title: "Direct Reports",
            value: "8", // This should ideally come from team hook
            icon: Users,
            description: "Active employees",
            color: "text-zinc-600",
            bg: "bg-zinc-100"
        },
        {
            title: "Pending Requests",
            value: pendingApprovals?.length || "0",
            icon: Clock,
            description: "Awaiting your review",
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "On Leave Today",
            value: "0", // This would need a specific "on leave today" endpoint
            icon: CalendarCheck,
            description: "Team availability",
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1 border-b border-border/40 pb-6">
                <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">Team Leave Management</h3>
                <p className="text-sm text-muted-foreground">Manage approvals and track attendance for your reports.</p>
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
                        {pendingApprovals && pendingApprovals.length > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 border-none px-1.5 h-4 min-w-4 flex items-center justify-center rounded-full text-[10px] font-bold">
                                {pendingApprovals.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="credit-requests" className="relative font-bold">
                        Credits
                        {pendingCredits && pendingCredits.length > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-zinc-100 text-zinc-700 border-none px-1.5 h-4 min-w-4 flex items-center justify-center rounded-full text-[10px] font-bold">
                                {pendingCredits.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="font-bold">History</TabsTrigger>
                    <TabsTrigger value="calendar" className="font-bold">Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="app-queue" className="mt-0">
                    <PendingApprovals />
                </TabsContent>

                <TabsContent value="credit-requests" className="mt-0">
                    <CreditApprovals />
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <LeaveHistoryTable
                        applications={teamApplications}
                        isLoading={isLoadingTeamApps}
                        variant="team"
                    />
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                    <TeamLeaveCalendar />
                </TabsContent>
            </Tabs>
        </div>
    )
}