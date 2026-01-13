"use client"

import { LeavePolicyConfig } from "@/features/leaves/components/leave-policy-config"
import { HolidayConfig } from "@/features/leaves/components/holiday-config"
import { Settings2, CalendarDays } from "lucide-react"

export default function LeaveSettingsPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            <div className="flex items-center gap-3 border-b border-border/40 pb-6">
                <div className="p-2 rounded-xl bg-primary/5 text-primary">
                    <Settings2 className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-serif font-medium text-foreground tracking-tight">System Settings</h2>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Manage organization-wide configurations.</p>
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
