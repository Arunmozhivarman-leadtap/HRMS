import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LeaveApplication } from "@/types/leave"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, Upload, User } from "lucide-react";
import { useCancelLeave } from "../hooks/use-leaves";
import { ApplyLeaveDialog } from "./apply-leave-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeaveHistoryTableProps {
    applications?: LeaveApplication[]
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
        default: return <Badge variant="outline">{status}</Badge>
    }
}

export function LeaveHistoryTable({ applications, isLoading, variant = 'self' }: LeaveHistoryTableProps) {
    const { mutate: cancelLeave, isPending: isCancelling } = useCancelLeave();
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const handleCancel = () => {
        if (idToDelete) {
            cancelLeave(idToDelete, {
                onSettled: () => {
                    setIdToDelete(null);
                }
            });
        }
    }


    if (isLoading) {
        return (
            <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
                <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-xl font-serif font-medium text-foreground">Leave History</CardTitle>
                    <CardDescription>Recent leave applications and their status.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Loading history...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

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
                <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                    <div className="overflow-auto max-h-[360px] flex-1">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/90 backdrop-blur-sm text-muted-foreground [&_th]:font-medium [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider sticky top-0 z-10 shadow-sm">
                                <tr className="border-b border-border/40">
                                    {(variant === 'team' || variant === 'admin') && <th className="h-10 px-6 align-middle">Employee</th>}
                                    <th className="h-10 px-6 align-middle">Type & Reason</th>
                                    <th className="h-10 px-6 align-middle">Dates & Duration</th>
                                    <th className="h-10 px-6 align-middle">Status</th>
                                    {variant === 'self' && <th className="h-10 px-6 align-middle text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {!applications || applications.length === 0 ? (
                                    <tr>
                                        <td colSpan={variant === 'self' ? 4 : 5} className="p-10 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <p>No leave applications found.</p>
                                                <p className="text-xs">Applications will appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app) => (
                                        <tr key={app.id} className="transition-colors hover:bg-muted/30">
                                            {(variant === 'team' || variant === 'admin') && (
                                                <td className="p-6 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="text-[10px]"><User className="h-3 w-3" /></AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-sm">{app.employee_name}</span>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="p-6 align-middle">
                                                <div className="font-medium text-foreground">{app.leave_type_name}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5 max-w-[250px]">{app.reason}</div>
                                                {app.attachment && (
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/leaves/applications/${app.id}/attachment`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline mt-2 bg-transparent border-none cursor-pointer p-0"
                                                    >
                                                        <Upload className="h-2.5 w-2.5" /> View Attachment
                                                    </a>
                                                )}
                                            </td>
                                            <td className="p-6 align-middle">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-medium">{app.number_of_days} {app.number_of_days === 1 ? 'Day' : 'Days'}</span>
                                                    <div className="text-xs text-muted-foreground">
                                                        <span>{formatDate(app.from_date)}</span>
                                                        {app.to_date && app.to_date !== app.from_date && (
                                                            <span> - {formatDate(app.to_date)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 align-middle">
                                                <div className="flex flex-col gap-2">
                                                    {getStatusBadge(app.status)}
                                                    {app.approver_note && (
                                                        <div className="text-[10px] text-muted-foreground bg-zinc-50 p-1.5 rounded border border-zinc-100 italic">
                                                            &quot;{app.approver_note}&quot;
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            {variant === 'self' && (
                                                <td className="p-6 align-middle text-right">
                                                    {app.status === 'pending' ? (
                                                        <div className="flex justify-end items-center gap-2">
                                                            <ApplyLeaveDialog
                                                                application={app}
                                                                applications={applications}
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
                                                                onClick={() => setIdToDelete(app.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Locked</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
