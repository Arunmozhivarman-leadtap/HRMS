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

import { usePagination } from "@/hooks/use-pagination"
import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"

export default function ManagerDocumentsPage() {
    const pagination = usePagination(10)

    const { data: stats, isLoading: statsLoading } = useQuery<TeamDocumentStats>({
        queryKey: ["team-document-stats"],
        queryFn: () => fetcher("/documents/reports")
    })

    const { data: teamDocuments, isLoading: docsLoading } = useQuery<any>({
        queryKey: ["team-documents", pagination.skip, pagination.limit, pagination.search],
        queryFn: () => fetcher(`/documents/list?skip=${pagination.skip}&limit=${pagination.limit}&search=${pagination.search}`)
    })

    const isLoading = statsLoading || docsLoading

    const getStatusBadge = (status: DocumentVerificationStatus) => {
        switch (status) {
            case DocumentVerificationStatus.verified: return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none capitalize font-bold text-[10px]">Verified</Badge>
            case DocumentVerificationStatus.rejected: return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-none capitalize font-bold text-[10px]">Rejected</Badge>
            case DocumentVerificationStatus.reupload_required: return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none capitalize font-bold text-[10px]">Re-upload Req</Badge>
            case DocumentVerificationStatus.expired: return <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none shadow-none capitalize font-bold text-[10px]">Expired</Badge>
            default: return <Badge variant="outline" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none shadow-none capitalize font-bold text-[10px]">Pending</Badge>
        }
    }

    const columns: ColumnDef<Document>[] = [
        {
            accessorKey: "employee",
            header: "Employee",
            cell: ({ row }) => `${row.original.employee?.first_name} ${row.original.employee?.last_name}`
        },
        {
            accessorKey: "document_type",
            header: "Document Type",
            cell: ({ row }) => row.original.document_type.replace(/_/g, " ")
        },
        {
            accessorKey: "verification_status",
            header: "Status",
            cell: ({ row }) => getStatusBadge(row.original.verification_status)
        },
        {
            accessorKey: "created_at",
            header: "Uploaded",
            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString()
        },
        {
            id: "actions",
            header: () => <div className="text-right">Action</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                        <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/documents/${row.original.id}/download`} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
            )
        }
    ]

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
                                    <Users className="h-4 w-4" /> Total Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-serif font-medium text-foreground">{stats?.total_documents || 0}</div>
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Team registry</p>
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
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Awaiting action</p>
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
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Expiring soon</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-primary" />
                                Team Documentation Registry
                            </h3>
                        </div>

                        <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
                            <CardHeader className="border-b border-border/40 pb-4">
                                <CardTitle className="text-xl font-serif font-medium text-foreground">Registry View</CardTitle>
                                <CardDescription>Complete view of documents you are authorized to access.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 flex flex-col min-h-0">
                                <DataTable
                                    columns={columns}
                                    data={teamDocuments?.items || []}
                                    totalCount={teamDocuments?.total || 0}
                                    pageIndex={pagination.pageIndex}
                                    pageSize={pagination.pageSize}
                                    onPageChange={pagination.onPageChange}
                                    onPageSizeChange={pagination.onPageSizeChange}
                                    onSearch={pagination.onSearch}
                                    isLoading={docsLoading}
                                    searchPlaceholder="Search team documents..."
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="personal" className="animate-in fade-in-50 duration-300 mt-0">
                    <MyDocumentsView />
                </TabsContent>
            </Tabs>
        </div>
    )
}
