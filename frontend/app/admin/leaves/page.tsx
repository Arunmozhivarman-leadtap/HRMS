import { Metadata } from "next"
import { MainLayout } from "@/layouts/main-layout"
import { AdminLeaveDashboard } from "@/features/admin/leaves/components/admin-leave-dashboard"

export const metadata: Metadata = {
    title: "HR Admin Leave Dashboard | HRMS",
    description: "Manage organization-wide leaves and configuration",
}

export default function AdminLeavePage() {
    return (
        <MainLayout>
            <div className="container mx-auto py-6 space-y-8 max-w-7xl">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">HR Admin Leave Console</h1>
                    <p className="text-zinc-500">Global leave management, configuration, and reporting.</p>
                </div>
                <AdminLeaveDashboard />
            </div>
        </MainLayout>
    )
}
