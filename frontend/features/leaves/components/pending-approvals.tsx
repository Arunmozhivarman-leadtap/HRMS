"use client"

import { useState } from "react"
import { usePendingApprovals, useApproveLeave, useRejectLeave } from "../hooks/use-leaves"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SimpleDialog } from "@/components/ui/simple-dialog"
import { Textarea } from "@/components/ui/textarea"
import { format, parseISO } from "date-fns"
import { LeaveApplication } from "@/types/leave"
import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { usePagination } from "@/hooks/use-pagination"

interface ActionDialogProps {
    application: LeaveApplication;
    type: 'approve' | 'reject';
    isOpen: boolean;
    onClose: () => void;
}

function ActionDialog({ application, type, isOpen, onClose }: ActionDialogProps) {
    const [note, setNote] = useState("")
    const { mutate: approve, isPending: isApproving } = useApproveLeave()
    const { mutate: reject, isPending: isRejecting } = useRejectLeave()

    const isPending = isApproving || isRejecting

    const handleAction = () => {
        const mutation = type === 'approve' ? approve : reject
        mutation({ id: application.id, note }, {
            onSuccess: () => {
                onClose()
                setNote("")
            }
        })
    }

    return (
        <SimpleDialog
            isOpen={isOpen}
            onClose={onClose}
            title={type === 'approve' ? "Approve Request" : "Reject Request"}
            description={`Reviewing leave request from ${application.employee_name}.`}
        >
            <div className="space-y-6 pt-4">
                <div className="bg-zinc-50/80 rounded-xl p-5 space-y-3 border border-zinc-100 shadow-sm">
                    <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2.5">
                        <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Type</span>
                        <span className="font-serif font-bold text-foreground">{application.leave_type_name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-zinc-100 pb-2.5">
                        <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Duration</span>
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-primary">{application.number_of_days} {application.number_of_days === 1 ? 'Day' : 'Days'}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                                {format(parseISO(application.from_date), 'MMM d, yyyy')}
                                {application.to_date && application.to_date !== application.from_date && ` — ${format(parseISO(application.to_date), 'MMM d, yyyy')}`}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 text-sm pt-1">
                        <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Employee Reason</span>
                        <div className="bg-white/60 p-3 rounded-lg border border-zinc-100/50 italic text-muted-foreground leading-relaxed text-xs">
                            &quot;{application.reason}&quot;
                        </div>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                        {type === 'approve' ? "Approver Note (Optional)" : "Reason for Rejection"}
                    </label>
                    <Textarea
                        placeholder={type === 'approve' ? "Add a note for the employee..." : "Please describe why this request is being rejected..."}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-[100px] text-sm bg-zinc-50 border-zinc-200 focus:ring-primary/20 transition-all resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                    <Button variant="ghost" onClick={onClose} disabled={isPending} className="font-medium text-xs">Cancel</Button>
                    <Button
                        variant={type === 'approve' ? "default" : "destructive"}
                        onClick={handleAction}
                        disabled={isPending || (type === 'reject' && !note)}
                        className="font-bold px-8 h-10 shadow-sm active:scale-95 transition-all text-sm"
                    >
                        {isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        {type === 'approve' ? "Approve Request" : "Reject Request"}
                    </Button>
                </div>
            </div>
        </SimpleDialog>
    )
}

export function PendingApprovals() {
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

    const { data: approvals, isLoading } = usePendingApprovals({ skip, limit, search })
    const [actionState, setActionState] = useState<{ app: LeaveApplication, type: 'approve' | 'reject' } | null>(null)

    const columns: ColumnDef<LeaveApplication>[] = [
        {
            accessorKey: "employee_name",
            header: "Employee",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border shadow-sm">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">{row.original.employee_name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                            {format(parseISO(row.original.created_at), 'MMM d, yyyy')}
                        </span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "leave_type_name",
            header: "Type & Reason",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-foreground">{row.original.leave_type_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[300px]" title={row.original.reason}>
                        &quot;{row.original.reason}&quot;
                    </div>
                </div>
            )
        },
        {
            accessorKey: "number_of_days",
            header: "Duration",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-primary">{row.original.number_of_days} {row.original.number_of_days === 1 ? 'Day' : 'Days'}</span>
                    <div className="text-[10px] text-muted-foreground font-medium">
                        <span>{format(parseISO(row.original.from_date), 'MMM d')}</span>
                        {row.original.to_date && row.original.to_date !== row.original.from_date && (
                            <span> — {format(parseISO(row.original.to_date), 'MMM d')}</span>
                        )}
                    </div>
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
                        onClick={() => setActionState({ app: row.original, type: 'approve' })}
                    >
                        <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-[11px] h-8 px-4 active:scale-95 transition-all rounded-lg bg-red-50/30"
                        onClick={() => setActionState({ app: row.original, type: 'reject' })}
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
                            <CardTitle className="text-xl font-serif font-medium text-foreground">Leave Applications Queue</CardTitle>
                            <CardDescription>Review and manage pending leave applications from employees.</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-bold rounded-full px-2 h-5 text-[10px]">
                            {approvals?.total || 0} Pending
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 flex flex-col min-h-0">
                    <DataTable
                        columns={columns}
                        data={approvals?.items || []}
                        totalCount={approvals?.total || 0}
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                        onPageSizeChange={onPageSizeChange}
                        onSearch={onSearch}
                        isLoading={isLoading}
                        searchPlaceholder="Search pending approvals..."
                        hasBorder={false}
                    />
                </CardContent>
            </Card>

            {actionState && (
                <ActionDialog
                    application={actionState.app}
                    type={actionState.type}
                    isOpen={!!actionState}
                    onClose={() => setActionState(null)}
                />
            )}
        </div>
    )
}