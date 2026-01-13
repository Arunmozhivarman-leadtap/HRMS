import { Metadata } from "next"
import { MainLayout } from "@/layouts/main-layout"
import { ManagerLeaveDashboard } from "@/features/manager/leaves/components/manager-leave-dashboard"

export const metadata: Metadata = {
    title: "Manager Leave Dashboard | HRMS",
    description: "Manage team leaves and approvals",
}

export default function ManagerLeavePage() {
    return (
        <MainLayout>
            <div className="container mx-auto py-6 space-y-8 max-w-7xl">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Manager Leave Dashboard</h1>
                    <p className="text-zinc-500">Overview of team leaves, approvals, and balances.</p>
                </div>
                <ManagerLeaveDashboard />
            </div>
        </MainLayout>
    )
}
