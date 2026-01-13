"use client"

import { useState } from "react"
import { SimpleDialog } from "@/components/ui/simple-dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Document, DocumentVerificationStatus } from "@/types/document"
import { useVerifyDocument } from "@/features/documents/hooks/use-document-verification"
import { Loader2, CheckCircle, XCircle, RefreshCw, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VerificationDialogProps {
    document: Document | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function VerificationDialog({ document, open, onOpenChange }: VerificationDialogProps) {
    const [notes, setNotes] = useState("")
    const [action, setAction] = useState<DocumentVerificationStatus | null>(null)
    const { toast } = useToast()
    const verifyMutation = useVerifyDocument()

    const handleAction = (status: DocumentVerificationStatus) => {
        if (!document) return

        // Validate mandatory notes for Rejection/Re-upload
        if ((status === DocumentVerificationStatus.rejected || status === DocumentVerificationStatus.reupload_required) && !notes.trim()) {
            toast({
                title: "Reason Required",
                description: "Please provide a reason/note when rejecting or requesting re-upload.",
                variant: "destructive",
            })
            return
        }

        // Use toast for feedback
        verifyMutation.mutate({
            id: document.id,
            data: { status, notes: notes || undefined }
        }, {
            onSuccess: () => {
                onOpenChange(false)
                setNotes("")
                setAction(null)
                toast({
                    title: "Success",
                    description: "Document status updated successfully",
                    variant: "default",
                })
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to update status",
                    variant: "destructive",
                })
            }
        })
    }

    // Reset state when closed
    if (!open && (notes || action)) {
        setNotes("")
        setAction(null)
    }

    if (!document) return null

    return (
        <SimpleDialog
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title="Verify Document"
            description={`Reviewing ${document.document_type.replace(/_/g, " ")} for Employee #${document.employee_id}`}
            className="sm:max-w-2xl p-5 overflow-hidden gap-0"
        >
            <div className="flex flex-col h-full bg-zinc-50/30">
                <div className="p-6 md:p-8 space-y-6 bg-white">
                    {/* Document Info Card */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-sm text-foreground">
                                    {document.file_path.split("/").pop()}
                                </span>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium">Uploaded:</span> {new Date(document.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="hidden sm:inline text-zinc-300">|</span>
                                    <span className="capitalize">{document.document_type.replace(/_/g, " ")}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-white" asChild>
                            <a href={`http://localhost:8000/api/documents/${document.id}/download`} target="_blank" rel="noopener noreferrer">
                                View File
                            </a>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Review Notes <span className="text-red-500 font-normal normal-case">* Required for Rejection/Re-upload</span>
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Add comments, rejection reasons, or notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px] bg-zinc-50 border-zinc-200 focus:ring-primary/20 resize-none"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-zinc-50/50 border-t border-zinc-200 flex flex-col sm:flex-row gap-3 justify-end mt-auto">
                    <Button
                        variant="destructive"
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                        onClick={() => handleAction(DocumentVerificationStatus.rejected)}
                        disabled={verifyMutation.isPending}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                    </Button>
                    <Button
                        variant="secondary"
                        className="border-amber-200 bg-amber-100 hover:bg-amber-200 text-amber-900 border"
                        onClick={() => handleAction(DocumentVerificationStatus.reupload_required)}
                        disabled={verifyMutation.isPending}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Request Re-upload
                    </Button>
                    <div className="flex-1 sm:flex-none"></div>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-6"
                        onClick={() => handleAction(DocumentVerificationStatus.verified)}
                        disabled={verifyMutation.isPending}
                    >
                        {verifyMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Approve Document
                    </Button>
                </div>
            </div>
        </SimpleDialog>
    )
}
