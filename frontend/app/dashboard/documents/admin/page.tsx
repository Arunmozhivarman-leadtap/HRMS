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

import { usePagination } from "@/hooks/use-pagination"
import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"

export default function AdminDocumentsPage() {
    const { user } = useUser()
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const queuePagination = usePagination(10)
    const allPagination = usePagination(10)

    // Strict role check: Super Admin (CEO) should NOT see My Documents/Personal Tab
    const canSeeMyDocuments = user?.role !== "super_admin"

    const { data: stats } = useQuery({
        queryKey: ["admin-document-stats"],
        queryFn: () => fetcher<any>("/documents/reports")
    })

    const { data: pendingDocuments, isLoading: isLoadingQueue } = useQuery<any>({
        queryKey: ["documents", "pending", queuePagination.skip, queuePagination.limit, queuePagination.search],
        queryFn: () => fetcher(`/documents/list?verification_status=pending&skip=${queuePagination.skip}&limit=${queuePagination.limit}&search=${queuePagination.search}`)
    })

    const { data: allDocuments, isLoading: isLoadingAll } = useQuery<any>({
        queryKey: ["documents", "all", allPagination.skip, allPagination.limit, allPagination.search],
        queryFn: () => fetcher(`/documents/list?skip=${allPagination.skip}&limit=${allPagination.limit}&search=${allPagination.search}`)
    })

    const handleVerifyClick = (doc: Document) => {
        setSelectedDoc(doc)
        setDialogOpen(true)
    }

    const getStatusBadge = (status: DocumentVerificationStatus) => {
        switch (status) {
            case DocumentVerificationStatus.verified: return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none capitalize font-bold text-[10px]">Verified</Badge>
            case DocumentVerificationStatus.rejected: return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-none capitalize font-bold text-[10px]">Rejected</Badge>
            case DocumentVerificationStatus.reupload_required: return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none capitalize font-bold text-[10px]">Re-upload Req</Badge>
            case DocumentVerificationStatus.expired: return <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none shadow-none capitalize font-bold text-[10px]">Expired</Badge>
            default: return <Badge variant="outline" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none shadow-none capitalize font-bold text-[10px]">Pending</Badge>
        }
    }

    const queueColumns: ColumnDef<Document>[] = [
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
            accessorKey: "created_at",
            header: "Uploaded",
            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString()
        },
        {
            id: "actions",
            header: () => <div className="text-right">Action</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button size="sm" onClick={() => handleVerifyClick(row.original)} className="font-bold text-[11px] h-8 rounded-lg">Review</Button>
                </div>
            )
        }
    ]

    const allColumns: ColumnDef<Document>[] = [
        {
            accessorKey: "employee",
            header: "Employee",
            cell: ({ row }) => `${row.original.employee?.first_name} ${row.original.employee?.last_name}`
        },
        {
            accessorKey: "document_type",
            header: "Type",
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
                    <Button variant="ghost" size="sm" onClick={() => handleVerifyClick(row.original)} className="font-bold text-[11px] h-8 rounded-lg">Details</Button>
                </div>
            )
        }
    ]

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
                        {pendingDocuments?.total > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 border-none px-1.5 h-4 min-w-4 flex items-center justify-center rounded-full text-[10px] font-bold">
                                {pendingDocuments.total}
                            </Badge>
                        )}
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
                        <CardContent className="p-4 pt-0 flex-1 flex flex-col min-h-0">
                            <DataTable
                                columns={queueColumns}
                                data={pendingDocuments?.items || []}
                                totalCount={pendingDocuments?.total || 0}
                                pageIndex={queuePagination.pageIndex}
                                pageSize={queuePagination.pageSize}
                                onPageChange={queuePagination.onPageChange}
                                onPageSizeChange={queuePagination.onPageSizeChange}
                                onSearch={queuePagination.onSearch}
                                isLoading={isLoadingQueue}
                                searchPlaceholder="Search queue..."
                                hasBorder={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                    <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
                        <CardHeader className="border-b border-border/40 pb-4">
                            <CardTitle className="text-xl font-serif font-medium text-foreground">Document Registry</CardTitle>
                            <CardDescription>Complete history of all employee documents.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-1 flex flex-col min-h-0">
                            <DataTable
                                columns={allColumns}
                                data={allDocuments?.items || []}
                                totalCount={allDocuments?.total || 0}
                                pageIndex={allPagination.pageIndex}
                                pageSize={allPagination.pageSize}
                                onPageChange={allPagination.onPageChange}
                                onPageSizeChange={allPagination.onPageSizeChange}
                                onSearch={allPagination.onSearch}
                                isLoading={isLoadingAll}
                                searchPlaceholder="Search documents..."
                                hasBorder={false}
                            />
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
