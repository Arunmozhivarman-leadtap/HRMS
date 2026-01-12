"use client"

import { useState } from "react"
import { useMyLeaveBalances, useMyLeaveApplications } from "@/features/leaves/hooks/use-leaves"
import { LeaveBalanceCard } from "@/features/leaves/components/leave-balance-card"
import { ApplyLeaveDialog } from "@/features/leaves/components/apply-leave-dialog"
import { LeaveCreditDialog } from "@/features/leaves/components/leave-credit-dialog"
import { LeaveHistoryTable } from "@/features/leaves/components/leave-history-table"
import { PublicHolidayList } from "@/features/leaves/components/public-holiday-list"
import { EmployeeLeaveCalendar } from "@/features/leaves/components/employee-leave-calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function EmployeeLeavesPage() {
    const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false)
    const { data: balances, isLoading: isLoadingBalances } = useMyLeaveBalances()
    const { data: applications, isLoading: isLoadingApps } = useMyLeaveApplications()

    return (
        <div className="space-y-8">
            {/* Header / Actions Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-serif font-medium text-foreground">Overview</h3>
                    <p className="text-sm text-muted-foreground">Track your leave balances and recent applications.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setIsCreditDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Request Credit
                    </Button>
                    <ApplyLeaveDialog />
                </div>
            </div>

            <LeaveCreditDialog
                open={isCreditDialogOpen}
                onOpenChange={setIsCreditDialogOpen}
            />

            {/* Top Row: Individual Balance Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <LeaveBalanceCard balances={balances} isLoading={isLoadingBalances} />
            </div>

            {/* Bottom Section: Main Content */}
            <div className="w-full">
                <Tabs defaultValue="history" className="w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <TabsList>
                            <TabsTrigger value="history">Leave History</TabsTrigger>
                            <TabsTrigger value="calendar">Monthly Calendar</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-12">
                            <TabsContent value="history" className="mt-0">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    <div className="lg:col-span-8">
                                        <LeaveHistoryTable applications={applications} isLoading={isLoadingApps} />
                                    </div>
                                    <div className="lg:col-span-4">
                                        <PublicHolidayList />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="calendar" className="mt-0">
                                <EmployeeLeaveCalendar />
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}



