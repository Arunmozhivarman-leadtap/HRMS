"use client"

import { PendingApprovals } from "@/features/leaves/components/pending-approvals"
import { AllRequestsTable } from "./all-requests-table"
import { LeavePolicyConfig } from "@/features/leaves/components/leave-policy-config"
import { HolidayConfig } from "./holiday-config"
import { LeaveAnalytics } from "./leave-analytics"
import { AllBalancesTable } from "./all-balances-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminLeaveDashboard() {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6 lg:w-[900px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="requests">All Requests</TabsTrigger>
                    <TabsTrigger value="balances">Balances</TabsTrigger>
                    <TabsTrigger value="config">Policies</TabsTrigger>
                    <TabsTrigger value="holidays">Holidays</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6 space-y-6">
                    <PendingApprovals />
                    {/* Could add quick stats here */}
                </TabsContent>
                
                <TabsContent value="requests" className="mt-6">
                    <AllRequestsTable />
                </TabsContent>

                <TabsContent value="balances" className="mt-6">
                    <AllBalancesTable />
                </TabsContent>
                
                <TabsContent value="config" className="mt-6">
                    <LeavePolicyConfig />
                </TabsContent>

                <TabsContent value="holidays" className="mt-6">
                    <HolidayConfig />
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    <LeaveAnalytics />
                </TabsContent>
            </Tabs>
        </div>
    )
}
