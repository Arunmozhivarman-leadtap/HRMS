"use client"

import { useTeamLeaveBalances } from "@/features/leaves/hooks/use-leaves"
import { usePagination } from "@/hooks/use-pagination"
import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { LeaveBalance } from "@/types/leave"

export function TeamBalancesTable() {
    const pagination = usePagination(10)
    const { data: response, isLoading } = useTeamLeaveBalances({
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
                    <span className="font-medium text-sm">{row.original.employee?.full_name || `Employee ${row.original.employee_id}`}</span>
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
        }
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Balances</CardTitle>
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
                    searchPlaceholder="Search team members..."
                    hasBorder={false}
                />
            </CardContent>
        </Card>
    )
}
