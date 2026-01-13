"use client"

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Loader2,
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    History,
    Users,
    FileCheck,
    FileWarning,
    ArrowRight,
    Search
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MyDocumentsView } from "@/features/documents/components/my-documents-view"
import { Document, DocumentVerificationStatus } from "@/types/document"

interface TeamDocumentStats {
    total_documents: number
    pending_count: number
    expiry_risks: number
}

export default function ManagerDocumentsPage() {
    const { data: stats, isLoading: statsLoading } = useQuery<TeamDocumentStats>({
        queryKey: ["team-document-stats"],
        queryFn: () => fetcher("/documents/reports")
    })

    const { data: teamDocuments, isLoading: docsLoading } = useQuery<Document[]>({
        queryKey: ["team-documents"],
        queryFn: () => fetcher("/documents/list")
    })

    const isLoading = statsLoading || docsLoading

    const getStatusBadge = (status: DocumentVerificationStatus) => {
        switch (status) {
            case DocumentVerificationStatus.verified: return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none capitalize">Verified</Badge>
            case DocumentVerificationStatus.rejected: return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-none capitalize">Rejected</Badge>
            case DocumentVerificationStatus.reupload_required: return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none capitalize">Re-upload Req</Badge>
            case DocumentVerificationStatus.expired: return <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none shadow-none capitalize">Expired</Badge>
            default: return <Badge variant="outline" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none shadow-none capitalize">Pending</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
        

            <Tabs defaultValue="team" className="space-y-8">
                <TabsList className="bg-muted/20 p-1 rounded-xl border border-border/40 inline-flex">
                    <TabsTrigger
                        value="team"
                        className="rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Team Documents
                    </TabsTrigger>
                    <TabsTrigger
                        value="personal"
                        className="rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        My Documents
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="team" className="space-y-8 animate-in fade-in-50 duration-300 mt-0">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="bg-background border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                    <Users className="h-4 w-4" /> Total Team Size
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-serif font-medium text-foreground">{stats?.total_documents || 0}</div>
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Active members</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-orange-600 flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Pending Reviews
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-serif font-medium text-foreground">{stats?.pending_count || 0}</div>
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Require attention</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-background border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-rose-600 flex items-center gap-2">
                                    <FileWarning className="h-4 w-4" /> Expiry Risks
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-serif font-medium text-foreground">{stats?.expiry_risks || 0}</div>
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Expiring in 30 days</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-primary" />
                                Direct Reports Documents
                            </h3>
                        </div>

                        <div className="grid gap-4">
                            {teamDocuments && teamDocuments.length > 0 ? (
                                <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
                                    <CardHeader className="border-b border-border/40 pb-4">
                                        <CardTitle className="text-xl font-serif font-medium text-foreground">Verified Documents</CardTitle>
                                        <CardDescription>Verified documents of your team members.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                                        <div className="overflow-auto max-h-[500px] flex-1">
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
                                                                {getStatusBadge(doc.verification_status)}
                                                            </td>
                                                            <td className="p-6 align-middle text-muted-foreground">
                                                                {new Date(doc.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-6 align-middle text-right">
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                                                    <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer">
                                                                        <Download className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-muted/5 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <FileText className="h-8 w-8 text-muted-foreground mb-4 opacity-50" />
                                        <h3 className="font-medium text-foreground">No documents found</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Your team documents will appear here once verifiied.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="personal" className="animate-in fade-in-50 duration-300 mt-0">
                    <MyDocumentsView />
                </TabsContent>
            </Tabs>
        </div>
    )
}
