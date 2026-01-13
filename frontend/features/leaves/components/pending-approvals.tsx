"use client"

import { useState } from "react"
import { usePendingApprovals, useApproveLeave, useRejectLeave } from "../hooks/use-leaves"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2, Calendar as CalendarIcon, User, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
    const { data: approvals, isLoading } = usePendingApprovals()
    const [actionState, setActionState] = useState<{ app: LeaveApplication, type: 'approve' | 'reject' } | null>(null)

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse bg-muted/10 h-64 border-dashed rounded-2xl" />
                ))}
            </div>
        )
    }

    if (!approvals || approvals.length === 0) return null

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">Requirement Review</h3>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-bold ml-1 rounded-full px-2 h-5 text-[10px]">
                        {approvals.length} Pending
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {approvals.map((app) => (
                    <Card key={app.id} className="group overflow-hidden hover:shadow-xl transition-all duration-500 border-zinc-200 shadow-sm bg-background flex flex-col">
                        <CardHeader className="p-0">
                            <div className="p-5 flex items-center gap-4 bg-zinc-50/50 border-b border-zinc-100 transition-colors duration-500 group-hover:bg-zinc-50">
                                <Avatar className="h-11 w-11 border-2 border-background shadow-md">
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                        <User className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex flex-col min-w-0">
                                    <span className="font-serif font-bold text-base truncate text-foreground tracking-tight">{app.employee_name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-bold mt-0.5">
                                        Submissions: {format(parseISO(app.created_at), 'MMM d')}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 flex-1 flex flex-col gap-5">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-zinc-100 text-zinc-600 transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                                            <CalendarIcon className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-bold text-zinc-700">{app.leave_type_name}</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                                        {app.number_of_days} {app.number_of_days === 1 ? 'Day' : 'Days'}
                                    </Badge>
                                </div>

                                <div className="bg-zinc-50/50 p-3 rounded-xl border border-zinc-100/50 group-hover:border-zinc-200 transition-all duration-300">
                                    <p className="text-[11px] text-muted-foreground line-clamp-3 italic leading-relaxed">
                                        &quot;{app.reason}&quot;
                                    </p>
                                </div>

                                <div className="flex items-center gap-2.5 text-[10px] font-bold text-zinc-500 px-1 py-1 uppercase tracking-tight">
                                    <Clock className="h-3 w-3 text-primary/40" />
                                    <span>{format(parseISO(app.from_date), 'EEE, MMM d')}</span>
                                    {app.to_date && app.to_date !== app.from_date && (
                                        <>
                                            <ArrowRight className="h-2.5 w-2.5 text-zinc-300" />
                                            <span>{format(parseISO(app.to_date), 'EEE, MMM d')}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-2 grid grid-cols-2 gap-3">
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-10 shadow-sm active:scale-95 transition-all rounded-lg"
                                    onClick={() => setActionState({ app, type: 'approve' })}
                                >
                                    <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-[11px] h-10 active:scale-95 transition-all rounded-lg bg-red-50/30"
                                    onClick={() => setActionState({ app, type: 'reject' })}
                                >
                                    <X className="mr-1.5 h-3.5 w-3.5" /> Reject
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