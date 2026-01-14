"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LeaveApplication } from "@/types/leave"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Upload, User, MoreVertical } from "lucide-react";
import { useCancelLeave } from "../hooks/use-leaves";
import { ApplyLeaveDialog } from "./apply-leave-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RecallLeaveDialog } from "./recall-leave-dialog";
import { format, parseISO, isAfter } from "date-fns";
import { DataTable } from "@/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeaveHistoryTableProps {
    data: LeaveApplication[]
    totalCount: number
    pageIndex: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    onSearch?: (value: string) => void
    isLoading: boolean
    variant?: 'self' | 'team' | 'admin'
}

function formatDate(dateString: string) {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-IN", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'approved': return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none">Approved</Badge>
        case 'rejected': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-none">Rejected</Badge>
        case 'pending': return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none shadow-none">Pending</Badge>
        case 'recalled': return <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200 shadow-none">Recalled</Badge>
        case 'cancelled': return <Badge variant="outline" className="bg-zinc-100 text-zinc-400 border-zinc-200 shadow-none">Cancelled</Badge>
        default: return <Badge variant="outline">{status}</Badge>
    }
}

export function LeaveHistoryTable({
    data,
    totalCount,
    pageIndex,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onSearch,
    isLoading,
    variant = 'self'
}: LeaveHistoryTableProps) {
    const { mutate: cancelLeave, isPending: isCancelling } = useCancelLeave();
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [appToRecall, setAppToRecall] = useState<LeaveApplication | null>(null);

    const handleCancel = () => {
        if (idToDelete) {
            cancelLeave(idToDelete, {
                onSettled: () => {
                    setIdToDelete(null);
                }
            });
        }
    }

    const columns: ColumnDef<LeaveApplication>[] = [
        ...(variant !== 'self' ? [{
            accessorKey: "employee_name",
            header: "Employee",
            cell: ({ row }: { row: any }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[10px]"><User className="h-3 w-3" /></AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{row.original.employee_name}</span>
                </div>
            )
        }] : []),
        {
            accessorKey: "leave_type_name",
            header: "Type & Reason",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-foreground">{row.original.leave_type_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 max-w-[250px]">{row.original.reason}</div>
                    {row.original.attachment && (
                        <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/leaves/applications/${row.original.id}/attachment`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-2 bg-transparent border-none cursor-pointer p-0"
                        >
                            <Upload className="h-2.5 w-2.5" /> View Attachment
                        </a>
                    )}
                </div>
            )
        },
        {
            accessorKey: "from_date",
            header: "Dates & Duration",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{row.original.number_of_days} {row.original.number_of_days === 1 ? 'Day' : 'Days'}</span>
                    <div className="text-xs text-muted-foreground">
                        <span>{formatDate(row.original.from_date)}</span>
                        {row.original.to_date && row.original.to_date !== row.original.from_date && (
                            <span> - {formatDate(row.original.to_date)}</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex flex-col gap-2">
                    {getStatusBadge(row.original.status)}
                    {(variant === 'admin' || variant === 'team') && row.original.status === 'approved' && isAfter(parseISO(row.original.to_date || row.original.from_date), new Date()) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 px-2 rounded-lg border border-zinc-200/50 w-fit"
                            onClick={() => setAppToRecall(row.original)}
                        >
                            Emergency Recall
                        </Button>
                    )}
                    {row.original.approver_note && (
                        <div className="text-[10px] text-muted-foreground bg-zinc-50 p-1.5 rounded border border-zinc-100 italic">
                            &quot;{row.original.approver_note}&quot;
                        </div>
                    )}
                </div>
            )
        },
        ...(variant === 'self' ? [{
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }: { row: any }) => (
                <div className="flex justify-end items-center gap-2">
                    {row.original.status === 'pending' ? (
                        <>
                            <ApplyLeaveDialog
                                application={row.original}
                                trigger={
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                }
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                onClick={() => setIdToDelete(row.original.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Locked</span>
                    )}
                </div>
            )
        }] : [])
    ];

    return (
        <>
            <ConfirmDialog
                isOpen={!!idToDelete}
                onClose={() => setIdToDelete(null)}
                onConfirm={handleCancel}
                isLoading={isCancelling}
                title="Cancel Leave Application"
                description="Are you sure you want to cancel this leave application? This action will revert your pending balance and cannot be undone."
                confirmText="Cancel Application"
            />

            <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
                <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-xl font-serif font-medium text-foreground">Leave History</CardTitle>
                    <CardDescription>
                        Recent leave applications and their status.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 flex flex-col min-h-0">
                    <DataTable
                        columns={columns}
                        data={data}
                        totalCount={totalCount}
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                        onPageSizeChange={onPageSizeChange}
                        onSearch={onSearch}
                        isLoading={isLoading}
                        showSearch={variant !== 'self'}
                        searchPlaceholder="Search history..."
                        hasBorder={false}
                    />
                </CardContent>
            </Card>

            {appToRecall && (
                <RecallLeaveDialog
                    application={appToRecall}
                    isOpen={!!appToRecall}
                    onClose={() => setAppToRecall(null)}
                />
            )}
        </>
    )
}
