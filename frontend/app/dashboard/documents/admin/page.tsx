"use client"

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ClipboardCheck, AlertCircle, Search, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Document, DocumentVerificationStatus } from "@/types/document"
import { VerificationDialog } from "@/components/documents/verification-dialog"
import { useState } from "react"
import { cn } from "@/lib/utils"
// Import MyDocumentsView
import { MyDocumentsView } from "@/features/documents/components/my-documents-view"
import { useUser } from "@/hooks/use-user"

export default function AdminDocumentsPage() {
    const { user } = useUser()
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Strict role check: Super Admin (CEO) should NOT see My Documents/Personal Tab
    const canSeeMyDocuments = user?.role !== "super_admin"

    const { data: stats } = useQuery({
        queryKey: ["admin-document-stats"],
        queryFn: () => fetcher<any>("/documents/reports")
    })

    const { data: pendingDocuments } = useQuery<Document[]>({
        queryKey: ["documents", "pending"],
        queryFn: () => fetcher("/documents/list?verification_status=pending")
    })

    const { data: allDocuments } = useQuery<Document[]>({
        queryKey: ["documents", "all"],
        queryFn: () => fetcher("/documents/list")
    })

    const handleVerifyClick = (doc: Document) => {
        setSelectedDoc(doc)
        setDialogOpen(true)
    }

    const filteredAllDocs = allDocuments?.filter(doc =>
        doc.employee?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employee?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: DocumentVerificationStatus) => {
        switch (status) {
            case DocumentVerificationStatus.verified: return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none capitalize">Verified</Badge>
            case DocumentVerificationStatus.rejected: return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-none capitalize">Rejected</Badge>
            case DocumentVerificationStatus.reupload_required: return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none capitalize">Re-upload Req</Badge>
            case DocumentVerificationStatus.expired: return <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none shadow-none capitalize">Expired</Badge>
            default: return <Badge variant="outline" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none shadow-none capitalize">Pending</Badge>
        }
    }

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
                <Card className="bg-background border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verification</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">{stats?.verified_percentage?.toFixed(1)}%</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Total compliance rate</p>
                    </CardContent>
                </Card>
                <Card className="bg-background border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">{stats?.status_distribution?.pending || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Awaiting review</p>
                    </CardContent>
                </Card>
                <Card className="bg-background border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rejected</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">{stats?.status_distribution?.rejected || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Require reupload</p>
                    </CardContent>
                </Card>
                <Card className="bg-background border shadow-sm">
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

            <Tabs defaultValue="queue" className="w-full space-y-6">
                <TabsList className="bg-muted/20 p-1 rounded-xl border border-border/40 inline-flex">
                    <TabsTrigger
                        value="queue"
                        className="rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        Verification Queue
                    </TabsTrigger>
                    <TabsTrigger
                        value="all"
                        className="rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                        All Documents
                    </TabsTrigger>
                    {canSeeMyDocuments && (
                        <TabsTrigger
                            value="personal"
                            className="rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            My Documents
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="queue" className="mt-0">
                    <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
                        <CardHeader className="border-b border-border/40 pb-4">
                            <CardTitle className="text-xl font-serif font-medium text-foreground">Verification Queue</CardTitle>
                            <CardDescription>Review and validate recently uploaded documents.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                            <div className="overflow-auto max-h-[500px] flex-1">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-muted/90 backdrop-blur-sm text-muted-foreground [&_th]:font-medium [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider sticky top-0 z-10 shadow-sm">
                                        <tr className="border-b border-border/40">
                                            <th className="h-10 px-6 align-middle">Employee</th>
                                            <th className="h-10 px-6 align-middle">Document Type</th>
                                            <th className="h-10 px-6 align-middle">Uploaded</th>
                                            <th className="h-10 px-6 align-middle text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {!pendingDocuments || pendingDocuments.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-10 text-center text-muted-foreground">
                                                    No pending documents to review.
                                                </td>
                                            </tr>
                                        ) : (
                                            pendingDocuments.map((doc) => (
                                                <tr key={doc.id} className="transition-colors hover:bg-muted/30">
                                                    <td className="p-6 align-middle font-medium">
                                                        {doc.employee?.first_name} {doc.employee?.last_name}
                                                    </td>
                                                    <td className="p-6 align-middle capitalize">
                                                        {doc.document_type.replace(/_/g, " ")}
                                                    </td>
                                                    <td className="p-6 align-middle">
                                                        {new Date(doc.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-6 align-middle text-right">
                                                        <Button size="sm" onClick={() => handleVerifyClick(doc)}>Review</Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                    <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
                        <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-serif font-medium text-foreground">Document Registry</CardTitle>
                                <CardDescription>Complete history of all employee documents.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search employees..."
                                        className="pl-9 w-[250px] bg-background border-border/60"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                            <div className="overflow-auto max-h-[600px] flex-1">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-muted/90 backdrop-blur-sm text-muted-foreground [&_th]:font-medium [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider sticky top-0 z-10 shadow-sm">
                                        <tr className="border-b border-border/40">
                                            <th className="h-10 px-6 align-middle">Employee</th>
                                            <th className="h-10 px-6 align-middle">Type</th>
                                            <th className="h-10 px-6 align-middle">Status</th>
                                            <th className="h-10 px-6 align-middle">Uploaded</th>
                                            <th className="h-10 px-6 align-middle text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {!filteredAllDocs || filteredAllDocs.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-10 text-center text-muted-foreground">
                                                    No documents found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAllDocs.map((doc) => (
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
                                                    <td className="p-6 align-middle">
                                                        {new Date(doc.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-6 align-middle text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => handleVerifyClick(doc)}>Details</Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {canSeeMyDocuments && (
                    <TabsContent value="personal" className="mt-0">
                        <MyDocumentsView />
                    </TabsContent>
                )}
            </Tabs>

            <VerificationDialog
                document={selectedDoc}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    )
}
