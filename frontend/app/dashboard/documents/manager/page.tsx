"use client"

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileCheck, AlertTriangle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Document, DocumentVerificationStatus } from "@/types/document"

interface TeamDocumentStats {
    total_employees: number
    verified_percentage: number
    pending_count: number
    expiry_risks: number
}

export default function ManagerDocumentsPage() {
    const { data: stats } = useQuery<TeamDocumentStats>({
        queryKey: ["team-document-stats"],
        queryFn: () => fetcher("/documents/reports")
    })

    const { data: teamDocuments } = useQuery<Document[]>({
        queryKey: ["team-documents"],
        queryFn: () => fetcher("/documents/list") // Backend handles filtering for Manager
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

            <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
                <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-xl font-serif font-medium text-foreground">Direct Reports Documents</CardTitle>
                    <CardDescription>Verified documents of your team members.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                    <div className="overflow-auto max-h-[500px] flex-1">
                        {teamDocuments && teamDocuments.length > 0 ? (
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-muted/90 backdrop-blur-sm text-muted-foreground [&_th]:font-medium [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider sticky top-0 z-10 shadow-sm">
                                    <tr className="border-b border-border/40">
                                        <th className="h-10 px-6 align-middle">Employee</th>
                                        <th className="h-10 px-6 align-middle">Document Type</th>
                                        <th className="h-10 px-6 align-middle">Status</th>
                                        <th className="h-10 px-6 align-middle">Uploaded</th>
                                        <th className="h-10 px-6 align-middle text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {teamDocuments.map((doc) => (
                                        <tr key={doc.id} className="transition-colors hover:bg-muted/30">
                                            <td className="p-6 align-middle font-medium">
                                                {doc.employee?.first_name} {doc.employee?.last_name}
                                            </td>
                                            <td className="p-6 align-middle capitalize">
                                                {doc.document_type.replace(/_/g, " ")}
                                            </td>
                                            <td className="p-6 align-middle">
                                                <Badge variant="secondary" className="capitalize bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none shadow-none">
                                                    Verified
                                                </Badge>
                                            </td>
                                            <td className="p-6 align-middle">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-6 align-middle text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`http://localhost:8000/api/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer">
                                                        View
                                                    </a>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                                <p>No verified documents found for your team.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
