"use client"

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileCheck, AlertTriangle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamDocumentStats {
// ... types ...
// ... types ...
    total_employees: number
    verified_percentage: number
    pending_count: number
    expiry_risks: number
}

export default function ManagerDocumentsPage() {
    const { data: stats } = useQuery<TeamDocumentStats>({
        queryKey: ["team-document-stats"],
        queryFn: () => fetcher("/documents/reports") // Assuming role-scoping handled by backend
    })

    const summaryCards = [
        {
            title: "Verification Rate",
            value: `${stats?.verified_percentage?.toFixed(0) || 0}%`,
            icon: ShieldCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Pending Review",
            value: stats?.pending_count || 0,
            icon: FileCheck,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "Expiry Risks",
            value: stats?.expiry_risks || 0,
            icon: AlertTriangle,
            color: "text-rose-600",
            bg: "bg-rose-50"
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1 border-b border-border/40 pb-6">
                <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">Team Compliance</h3>
                <p className="text-sm text-muted-foreground">Monitor document verification status for your direct reports.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {summaryCards.map((card) => (
                    <Card key={card.title} className="border-none shadow-sm bg-background">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div className={cn("p-2 rounded-lg", card.bg, card.color)}>
                                <card.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-serif font-medium">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-background border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-serif">Direct Reports</CardTitle>
                    <CardDescription>Click on an employee to view their detailed records.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="text-center py-20 bg-muted/5">
                        <p className="text-sm text-muted-foreground italic tracking-tight">Individual team member table will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
