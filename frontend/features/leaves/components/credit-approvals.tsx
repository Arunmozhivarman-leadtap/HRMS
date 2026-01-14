"use client"

import { useState } from "react"
import { usePendingCreditRequests, useApproveLeaveCredit, useRejectLeaveCredit } from "../hooks/use-leaves"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SimpleDialog } from "@/components/ui/simple-dialog"
import { format, parseISO } from "date-fns"
import { LeaveCreditRequest } from "@/types/leave"
import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { usePagination } from "@/hooks/use-pagination"

interface CreditActionDialogProps {
    request: LeaveCreditRequest;
    type: 'approve' | 'reject';
    isOpen: boolean;
    onClose: () => void;
}

function CreditActionDialog({ request, type, isOpen, onClose }: CreditActionDialogProps) {
    const { mutate: approve, isPending: isApproving } = useApproveLeaveCredit()
    const { mutate: reject, isPending: isRejecting } = useRejectLeaveCredit()

    const isPending = isApproving || isRejecting

    const handleAction = () => {
        const mutation = type === 'approve' ? approve : reject
        mutation(request.id, {
            onSuccess: () => {
                onClose()
            }
        })
    }

    return (
        <SimpleDialog
            isOpen={isOpen}
            onClose={onClose}
            title={type === 'approve' ? "Confirm Approval" : "Confirm Rejection"}
            description={`${type === 'approve' ? 'Approve' : 'Reject'} leave credit request from ${request.employee_name || 'Employee'}.`}
        >
            <div className="space-y-6 pt-4">
                <div className="bg-zinc-50/80 rounded-xl p-5 space-y-3 border border-zinc-100 shadow-sm">
                    <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2.5">
                        <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Date Worked</span>
                        <span className="font-serif font-bold text-foreground">
                            {format(parseISO(request.date_worked), 'MMM d, yyyy')}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-sm pt-1">
                        <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Reason / Work Description</span>
                        <div className="bg-white/60 p-3 rounded-lg border border-zinc-100/50 italic text-muted-foreground leading-relaxed text-xs">
                            &quot;{request.reason}&quot;
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                    <Button variant="ghost" onClick={onClose} disabled={isPending} className="font-medium text-xs">Cancel</Button>
                    <Button
                        variant={type === 'approve' ? "default" : "destructive"}
                        onClick={handleAction}
                        disabled={isPending}
                        className="font-bold px-8 h-10 shadow-sm active:scale-95 transition-all text-sm"
                    >
                        {isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        {type === 'approve' ? "Confirm Approval" : "Confirm Rejection"}
                    </Button>
                </div>
            </div>
        </SimpleDialog>
    )
}

export function CreditApprovals() {
    const {
        pageIndex,
        pageSize,
        search,
        skip,
        limit,
        onPageChange,
        onPageSizeChange,
        onSearch
    } = usePagination(10)

    const { data: requests, isLoading } = usePendingCreditRequests({ skip, limit, search })
    const [actionState, setActionState] = useState<{ request: LeaveCreditRequest, type: 'approve' | 'reject' } | null>(null)

    const columns: ColumnDef<LeaveCreditRequest>[] = [
        {
            accessorKey: "employee_name",
            header: "Employee",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border shadow-sm">
                        <AvatarFallback className="bg-zinc-100 text-zinc-700 text-xs font-bold">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">{row.original.employee_name || 'Employee'}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                            {format(parseISO(row.original.created_at), 'MMM d, yyyy')}
                        </span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "date_worked",
            header: "Date Worked",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-zinc-900">+1 Credit</span>
                    <span className="text-xs text-muted-foreground">{format(parseISO(row.original.date_worked), 'EEE, MMM d, yyyy')}</span>
                </div>
            )
        },
        {
            accessorKey: "reason",
            header: "Reason / Description",
            cell: ({ row }) => (
                <div className="bg-zinc-50/50 p-2 rounded-lg border border-zinc-100/50 max-w-[400px]">
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-2" title={row.original.reason}>
                        &quot;{row.original.reason}&quot;
                    </p>
                </div>
            )
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-8 px-4 shadow-sm active:scale-95 transition-all rounded-lg"
                        onClick={() => setActionState({ request: row.original, type: 'approve' })}
                    >
                        <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-[11px] h-8 px-4 active:scale-95 transition-all rounded-lg bg-red-50/10"
                        onClick={() => setActionState({ request: row.original, type: 'reject' })}
                    >
                        <X className="mr-1.5 h-3.5 w-3.5" /> Reject
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-8">
            <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
                <CardHeader className="border-b border-border/40 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-serif font-medium text-foreground">Credit Review Queue</CardTitle>
                            <CardDescription>Review and manage pending compensatory leave credit requests.</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-zinc-50 text-zinc-700 border-zinc-200 font-bold rounded-full px-2 h-5 text-[10px]">
                            {requests?.total || 0} Pending
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 flex flex-col min-h-0">
                    <DataTable
                        columns={columns}
                        data={requests?.items || []}
                        totalCount={requests?.total || 0}
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                        onPageSizeChange={onPageSizeChange}
                        onSearch={onSearch}
                        isLoading={isLoading}
                        searchPlaceholder="Search credit requests..."
                        hasBorder={false}
                    />
                </CardContent>
            </Card>

            {actionState && (
                <CreditActionDialog
                    request={actionState.request}
                    type={actionState.type}
                    isOpen={!!actionState}
                    onClose={() => setActionState(null)}
                />
            )}
        </div>
    )
}
