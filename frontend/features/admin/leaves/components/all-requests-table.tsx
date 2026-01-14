"use client"

import { useAllLeaveApplications } from "@/features/leaves/hooks/use-leaves"
import { usePagination } from "@/hooks/use-pagination"
import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeaveApplication } from "@/types/leave"

export function AllRequestsTable() {
    const pagination = usePagination(10)
    const { data: response, isLoading } = useAllLeaveApplications({
        skip: pagination.skip,
        limit: pagination.limit,
        search: pagination.search
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "bg-emerald-100 text-emerald-700 border-emerald-200"
            case "rejected": return "bg-red-100 text-red-700 border-red-200"
            case "pending": return "bg-amber-100 text-amber-700 border-amber-200"
            case "cancelled": return "bg-zinc-100 text-zinc-700 border-zinc-200"
            default: return "bg-zinc-100 text-zinc-700"
        }
    }

    const columns: ColumnDef<LeaveApplication>[] = [
        {
            accessorKey: "employee_name",
            header: "Employee",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{row.original.employee_name}</span>
                </div>
            )
        },
        {
            accessorKey: "leave_type_name",
            header: "Type",
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.leave_type_name}</span>
        },
        {
            accessorKey: "number_of_days",
            header: "Duration",
            cell: ({ row }) => <span>{row.original.number_of_days} Days</span>
        },
        {
            accessorKey: "date_range",
            header: "Dates",
            cell: ({ row }) => (
                <span className="text-sm">
                    {format(parseISO(row.original.from_date), 'MMM d, yyyy')}
                    {row.original.to_date && row.original.to_date !== row.original.from_date && ` - ${format(parseISO(row.original.to_date), 'MMM d, yyyy')}`}
                </span>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="outline" className={`capitalize ${getStatusColor(row.original.status)}`}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            accessorKey: "created_at",
            header: () => <div className="text-right">Applied On</div>,
            cell: ({ row }) => (
                <div className="text-right text-muted-foreground text-sm">
                    {format(parseISO(row.original.created_at), 'MMM d')}
                </div>
            )
        }
    ]

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>All Leave Requests</CardTitle>
                    <CardDescription>Comprehensive history of all applications in the system.</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <DataTable
                    columns={columns}
                    data={response?.items || []}
                    totalCount={response?.total || 0}
                    pageIndex={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    onPageChange={pagination.onPageChange}
                    onPageSizeChange={pagination.onPageSizeChange}
                    onSearch={pagination.onSearch}
                    isLoading={isLoading}
                    searchPlaceholder="Search history..."
                    hasBorder={false}
                />
            </CardContent>
        </Card>
    )
}
