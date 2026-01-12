"use client"

import { LeavePolicyConfig } from "@/features/leaves/components/leave-policy-config"
import { Settings2 } from "lucide-react"

export default function LeaveSettingsPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-3 border-b border-border/40 pb-6">
                <div className="p-2 rounded-xl bg-primary/5 text-primary">
                    <Settings2 className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-serif font-medium text-foreground tracking-tight">System Settings</h2>
                    <p className="text-sm text-muted-foreground font-medium">Manage organization-wide configurations.</p>
                </div>
            </div>

            <LeavePolicyConfig />
        </div>
    )
}
