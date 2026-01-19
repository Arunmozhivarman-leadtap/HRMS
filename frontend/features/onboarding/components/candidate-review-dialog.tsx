import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCandidateTasks } from "../hooks/use-onboarding"
import { CandidateResponse } from "@/types/onboarding"
import { Loader2, FileText, CheckCircle2, XCircle, AlertCircle, Download, ExternalLink } from "lucide-react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@radix-ui/react-scroll-area"

interface CandidateReviewDialogProps {
    candidate: CandidateResponse
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CandidateReviewDialog({ candidate, open, onOpenChange }: CandidateReviewDialogProps) {
    const { data: tasks, isLoading } = useCandidateTasks(candidate.id)

    const getFileUrl = (path: string) => {
        // Assuming backend serves uploads from /uploads
        // If stored as "candidates/1/file.pdf", we need a full URL.
        // Backend mounts /uploads -> settings.UPLOAD_ROOT
        
        // Remove "uploads/" prefix if path already has it (safety check)
        const cleanPath = path.startsWith("uploads/") ? path.replace("uploads/", "") : path;
        
        return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/${cleanPath}`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl font-serif">Document Review</DialogTitle>
                        <Badge variant="outline">{candidate.full_name}</Badge>
                    </div>
                    <DialogDescription>
                        Review uploaded documents and track onboarding progress.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden min-h-[300px]">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
                        </div>
                    ) : tasks?.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <AlertCircle className="h-8 w-8" />
                            <p>No tasks assigned or initialized.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-4 py-2">
                                {tasks?.map((task) => (
                                    <div key={task.id} className="flex items-start gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                                        <div className={cn(
                                            "mt-1 p-2 rounded-full shrink-0",
                                            task.status === "completed" ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                                        )}>
                                            {task.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-sm">{task.checklist_item.name}</p>
                                                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold">
                                                    {task.checklist_item.category}
                                                </Badge>
                                            </div>
                                            
                                            {task.uploaded_file ? (
                                                <div className="flex items-center gap-3 mt-2 bg-muted/40 p-2 rounded-lg border border-dashed">
                                                    <FileText className="h-3.5 w-3.5 text-primary" />
                                                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                                                        {task.uploaded_file.split('/').pop()}
                                                    </span>
                                                    <div className="ml-auto flex gap-1">
                                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                                                            <a href={getFileUrl(task.uploaded_file)} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">Pending upload...</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
