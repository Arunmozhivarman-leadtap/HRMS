"use client"

import { useAllLeaveBalances } from "@/features/leaves/hooks/use-leaves"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { usePagination } from "@/hooks/use-pagination"
import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeaveBalance } from "@/types/leave"

export function AllBalancesTable() {
    const pagination = usePagination(10)
    const { data: response, isLoading } = useAllLeaveBalances({
        skip: pagination.skip,
        limit: pagination.limit,
        search: pagination.search
    })

    const columns: ColumnDef<LeaveBalance>[] = [
        {
            accessorKey: "employee",
            header: "Employee",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{row.original.employee?.full_name || `ID: ${row.original.employee_id}`}</span>
                </div>
            )
        },
        {
            accessorKey: "leave_type",
            header: "Leave Type",
            cell: ({ row }) => <span className="capitalize text-xs">{row.original.leave_type.name.replace(/_/g, ' ')}</span>
        },
        {
            accessorKey: "available",
            header: () => <div className="text-right">Available</div>,
            cell: ({ row }) => <div className="text-right font-bold text-emerald-600">{row.original.available}</div>
        },
        {
            accessorKey: "taken",
            header: () => <div className="text-right">Taken</div>,
            cell: ({ row }) => <div className="text-right text-muted-foreground">{row.original.taken}</div>
        },
        {
            accessorKey: "pending_approval",
            header: () => <div className="text-right">Pending</div>,
            cell: ({ row }) => <div className="text-right text-amber-600">{row.original.pending_approval}</div>
        },
        {
            accessorKey: "accrued",
            header: () => <div className="text-right">Accrued (YTD)</div>,
            cell: ({ row }) => <div className="text-right text-zinc-500">{row.original.accrued}</div>
        }
    ]

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Employee Leave Balances</CardTitle>
                    <CardDescription>Real-time credits for all employees across all types.</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Export
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
                    searchPlaceholder="Search employee..."
                    hasBorder={false}
                />
            </CardContent>
        </Card>
    )
}
