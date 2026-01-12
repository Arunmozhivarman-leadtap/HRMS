"use client"

import { useState } from "react"
import { usePendingApprovals, useApproveLeave, useRejectLeave } from "../hooks/use-leaves"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2, Calendar as CalendarIcon, User } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SimpleDialog } from "@/components/ui/simple-dialog"
import { Textarea } from "@/components/ui/textarea"
import { format, parseISO } from "date-fns"
import { LeaveApplication } from "@/types/leave"

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
            title={type === 'approve' ? "Approve Leave Request" : "Reject Leave Request"}
            description={`Reviewing request from ${application.employee_name}.`}
        >
            <div className="space-y-4 pt-4">
                <div className="bg-muted/30 rounded-lg p-4 space-y-2 border">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{application.leave_type_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{application.number_of_days} Days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reason:</span>
                        <span className="font-medium italic">&quot;{application.reason}&quot;</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {type === 'approve' ? "Approver Note (Optional)" : "Reason for Rejection"}
                    </label>
                    <Textarea 
                        placeholder={type === 'approve' ? "Add a note for the employee..." : "Please explain why the request is being rejected..."}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-[100px] text-sm"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button 
                        variant={type === 'approve' ? "default" : "destructive"}
                        onClick={handleAction}
                        disabled={isPending || (type === 'reject' && !note)}
                        className="font-bold px-6"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {type === 'approve' ? "Confirm Approval" : "Confirm Rejection"}
                    </Button>
                </div>
            </div>
        </SimpleDialog>
    )
}

export function PendingApprovals() {
    const { data: approvals, isLoading } = usePendingApprovals()
    const [actionState, setActionState] = useState<{ app: LeaveApplication, type: 'approve' | 'reject' } | null>(null)

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse bg-muted/20 h-48 border-dashed" />
                ))}
            </div>
        )
    }

    if (!approvals || approvals.length === 0) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-4">
                <h3 className="text-lg font-serif font-medium text-foreground tracking-tight">Pending Approvals</h3>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{approvals.length}</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {approvals.map((app) => (
                    <Card key={app.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-zinc-200">
                        <CardHeader className="pb-3 border-b border-zinc-50 bg-zinc-50/50">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                    <AvatarFallback className="bg-primary/5 text-primary">
                                        <User className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-serif font-medium text-sm truncate">{app.employee_name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Applied {format(parseISO(app.created_at), 'MMM d')}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-zinc-100 text-zinc-600">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-xs font-medium">{app.leave_type_name}</span>
                                    </div>
                                    <span className="text-xs font-serif font-bold text-primary">{app.number_of_days} Days</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground line-clamp-2 italic px-1">
                                    &quot;{app.reason}&quot;
                                </div>
                                <div className="text-[10px] font-medium text-muted-foreground bg-zinc-50 px-2 py-1.5 rounded flex items-center gap-2 border border-zinc-100">
                                    <div className="size-1.5 rounded-full bg-primary/40" />
                                    {format(parseISO(app.from_date), 'EEE, MMM d')}
                                    {app.to_date && app.to_date !== app.from_date && ` — ${format(parseISO(app.to_date), 'EEE, MMM d')}`}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Button 
                                    size="sm" 
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-9 shadow-sm"
                                    onClick={() => setActionState({ app, type: 'approve' })}
                                >
                                    <Check className="mr-1 h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="ghost"
                                    className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-[11px] h-9"
                                    onClick={() => setActionState({ app, type: 'reject' })}
                                >
                                    <X className="mr-1 h-3.5 w-3.5" /> Reject
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

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