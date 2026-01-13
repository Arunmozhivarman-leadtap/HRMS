"use client"

import { PendingApprovals } from "@/features/leaves/components/pending-approvals"
import { TeamLeaveCalendar } from "@/features/leaves/components/team-leave-calendar"
import { TeamBalancesTable } from "./team-balances-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ManagerLeaveDashboard() {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="approvals" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="approvals">Approvals</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="balances">Balances</TabsTrigger>
                </TabsList>
                
                <TabsContent value="approvals" className="mt-6">
                    <PendingApprovals />
                </TabsContent>
                
                <TabsContent value="calendar" className="mt-6">
                    <TeamLeaveCalendar />
                </TabsContent>
                
                <TabsContent value="balances" className="mt-6">
                    <TeamBalancesTable />
                </TabsContent>
            </Tabs>
        </div>
    )
}
