"use client"

import { useState } from "react"
import { useRecallLeave } from "../hooks/use-leaves"
import { Button } from "@/components/ui/button"
import { SimpleDialog } from "@/components/ui/simple-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle } from "lucide-react"
import { LeaveApplication } from "@/types/leave"
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns"

interface RecallLeaveDialogProps {
    application: LeaveApplication
    isOpen: boolean
    onClose: () => void
}

export function RecallLeaveDialog({ application, isOpen, onClose }: RecallLeaveDialogProps) {
    const [recallDate, setRecallDate] = useState(
        // Default to today if within range, else from_date
        format(new Date(), 'yyyy-MM-dd')
    )
    const [reason, setReason] = useState("")
    const { mutate: recall, isPending } = useRecallLeave()

    const handleRecall = () => {
        recall({
            id: application.id,
            recallDate,
            reason
        }, {
            onSuccess: () => {
                onClose()
                setReason("")
            }
        })
    }

    // Validation: recall date must be between from_date and to_date
    const fromDate = parseISO(application.from_date)
    const toDate = application.to_date ? parseISO(application.to_date) : fromDate
    const selectedDate = parseISO(recallDate)

    const isValidDate = !isBefore(selectedDate, fromDate) && isBefore(selectedDate, toDate)

    return (
        <SimpleDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Recall Employee from Leave"
            description={`Prematurely end leave for ${application.employee_name}. Unused days will be credited back.`}
        >
            <div className="space-y-6 pt-4">
                <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground uppercase font-bold tracking-wider">Original Duration</span>
                        <span className="font-medium text-foreground">
                            {format(fromDate, 'MMM d, yyyy')} — {format(toDate, 'MMM d, yyyy')}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground uppercase font-bold tracking-wider">Total Days</span>
                        <span className="font-bold text-zinc-900">{application.number_of_days} Days</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="recallDate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                            New End Date (Recall Date)
                        </Label>
                        <Input
                            id="recallDate"
                            type="date"
                            value={recallDate}
                            min={application.from_date}
                            max={format(addDays(toDate, -1), 'yyyy-MM-dd')}
                            onChange={(e) => setRecallDate(e.target.value)}
                            className="bg-zinc-50 border-zinc-200 focus:ring-zinc-500/10"
                        />
                        {!isValidDate && (
                            <p className="flex items-center gap-1.5 text-[10px] text-red-600 font-medium px-1 mt-1.5">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Date must be between {format(fromDate, 'MMM d')} and {format(addDays(toDate, -1), 'MMM d')}
                            </p>
                        )}
                        <p className="text-[10px] text-muted-foreground px-1 italic">
                            The employee's leave will now end on this date.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                            Reason for Recall
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="e.g., Emergency project requirement, Critical client meeting..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[100px] text-sm bg-zinc-50 border-zinc-200 focus:ring-zinc-500/10 resize-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                    <Button variant="ghost" onClick={onClose} disabled={isPending} className="font-medium text-xs">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRecall}
                        disabled={isPending || !reason || !isValidDate}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 h-10 shadow-sm active:scale-95 transition-all text-sm rounded-lg"
                    >
                        {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                        Confirm Recall
                    </Button>
                </div>
            </div>
        </SimpleDialog>
    )
}
