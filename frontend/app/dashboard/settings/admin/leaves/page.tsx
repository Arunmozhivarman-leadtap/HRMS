"use client"

import { LeavePolicyConfig } from "@/features/leaves/components/leave-policy-config"
import { HolidayConfig } from "@/features/leaves/components/holiday-config"
import { Settings2, CalendarDays } from "lucide-react"

export default function LeaveSettingsPage() {
    return (
        <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">System Settings</h3>
                    <p className="text-sm text-muted-foreground">Manage organization-wide leave policies and holiday configurations.</p>
                </div>
            </div>

            <section className="space-y-6">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h3 className="text-lg font-serif font-bold tracking-tight">Leave Policy Framework</h3>
                </div>
                <LeavePolicyConfig />
            </section>

            <section className="space-y-6 pt-8 border-t border-zinc-100">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1.5 h-6 bg-zinc-300 rounded-full" />
                    <h3 className="text-lg font-serif font-bold tracking-tight text-zinc-600">Public Holiday Calendar</h3>
                </div>
                <HolidayConfig />
            </section>
        </div>
    )
}
