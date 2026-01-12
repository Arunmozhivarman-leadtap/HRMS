"use client"

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ClipboardCheck, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDocumentsPage() {
    const { data: stats } = useQuery({
        queryKey: ["admin-document-stats"],
        queryFn: () => fetcher("/documents/reports")
    })

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">Organization Control</h3>
                    <p className="text-sm text-muted-foreground">Global verification queue and compliance monitoring.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-full font-bold px-6 border-zinc-200">Export Report</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verification</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">{stats?.verified_percentage?.toFixed(1)}%</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Total compliance rate</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">{stats?.status_distribution?.pending || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Awaiting review</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rejected</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">{stats?.status_distribution?.rejected || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Require reupload</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expiry Risks</CardTitle>
                        <AlertCircle className="h-4 w-4 text-zinc-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">{stats?.expiry_risks_30_days || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Expiring within 30 days</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="queue" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="queue">Verification Queue</TabsTrigger>
                    <TabsTrigger value="all">All Employee Records</TabsTrigger>
                </TabsList>

                <TabsContent value="queue" className="mt-0">
                    <Card className="bg-background border shadow-sm">
                        <CardHeader className="border-b border-border/40">
                            <CardTitle className="text-lg font-serif">Pending Verification</CardTitle>
                            <CardDescription>Review and validate recently uploaded documents.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="text-center py-20 bg-muted/5">
                                <p className="text-sm text-muted-foreground italic tracking-tight font-medium">Pending queue table will appear here.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                    <div className="text-center py-20 bg-muted/5 rounded-xl border border-dashed">
                        <p className="text-sm text-muted-foreground italic tracking-tight font-medium">Full organization document repository coming soon.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
