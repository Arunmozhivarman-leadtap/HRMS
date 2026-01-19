"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, FileText, Calendar as CalendarIcon, Link2, Copy, Check, BadgeCheck, X } from "lucide-react"
import { CandidateResponse } from "@/types/onboarding"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"

export function SendOfferDialog({ candidate, open, onOpenChange }: { candidate: CandidateResponse, open: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const [expiryDays, setExpiryDays] = useState(7)
    const [hrName, setHrName] = useState("HR Team")
    const [hrEmail, setHrEmail] = useState("")
    const [offerFile, setOfferFile] = useState<File | null>(null)

    const [offerLink, setOfferLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const sendMutation = useMutation({
        mutationFn: async (data: { expiry_days: number, hr_name: string, hr_email: string, file: File | null }) => {
            const formData = new FormData()
            formData.append("expiry_days", data.expiry_days.toString())
            formData.append("hr_name", data.hr_name)
            formData.append("hr_email", data.hr_email)
            if (data.file) {
                formData.append("file", data.file)
            }

            return fetcher(`/onboarding/candidates/${candidate.id}/offer`, {
                method: "POST",
                body: formData
            })
        },
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ["candidates"] })
            setOfferLink(res.link)
            toast({ title: "Offer Sent", description: "Email sent to candidate with access link." })
        }
    })

    const handleCopy = () => {
        if (offerLink) {
            const fullLink = `${window.location.origin}${offerLink}`
            navigator.clipboard.writeText(fullLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleClose = () => {
        onOpenChange(false)
        setTimeout(() => setOfferLink(null), 300) // Reset after animation
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl w-full p-0 gap-0 overflow-hidden">
                {offerLink ? (
                    <div className="flex flex-col w-full overflow-hidden">
                        <div className="bg-emerald-600 p-8 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                                <BadgeCheck className="h-12 w-12 text-white" />
                            </div>
                            <div className="space-y-1 w-full">
                                <h3 className="text-2xl font-bold text-white">Offer Sent Successfully!</h3>
                                <p className="text-emerald-100 font-medium break-words">Offer generated for {candidate.full_name}</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6 bg-white">
                            <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manual Access Link</Label>
                                <div className="flex gap-2 w-full">
                                    <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 h-11 flex items-center overflow-hidden min-w-0">
                                        <span className="text-sm text-zinc-600 truncate">{window.location.origin}{offerLink}</span>
                                    </div>
                                    <Button size="icon" variant="outline" className="h-11 w-11 shrink-0 border-zinc-200 hover:bg-zinc-50 hover:text-foreground" onClick={handleCopy}>
                                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    The candidate has also received an email with this link.
                                </p>
                            </div>

                            <Button onClick={handleClose} className="w-full h-11 font-bold rounded-lg" variant="outline">
                                Close Window
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="p-6 border-b border-zinc-100 space-y-1">
                            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                Prepare Offer Letter
                            </DialogTitle>
                            <DialogDescription>
                                Configure the offer access parameters for <strong>{candidate.full_name}</strong>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 space-y-6">
                            <div className="space-y-7">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">HR Name</Label>
                                        <Input
                                            value={hrName}
                                            onChange={(e) => setHrName(e.target.value)}
                                            placeholder="e.g. John Doe"
                                            className="bg-zinc-50 border-zinc-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">HR Email</Label>
                                        <Input
                                            value={hrEmail}
                                            onChange={(e) => setHrEmail(e.target.value)}
                                            placeholder="e.g. hr@company.com"
                                            className="bg-zinc-50 border-zinc-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Link Expiration</Label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-24">
                                            <Input
                                                type="number"
                                                value={expiryDays}
                                                onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                                                className="h-10 pr-8 bg-zinc-50 border-zinc-200 font-medium"
                                                min={1}
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">days</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-zinc-50 px-3 py-2 rounded-md border border-zinc-100">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            Valid until {new Date(Date.now() + expiryDays * 86400000).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signed Offer Document (Optional)</Label>
                                    <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 hover:bg-zinc-50/50 transition-colors bg-zinc-50/30">
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-1">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="offer-file" className="text-sm font-semibold cursor-pointer hover:underline text-primary">
                                                    Click to upload offer letter
                                                </Label>
                                                <p className="text-xs text-muted-foreground">PDF or DOCX (Max 5MB)</p>
                                            </div>
                                            <Input
                                                id="offer-file"
                                                type="file"
                                                onChange={(e) => setOfferFile(e.target.files?.[0] || null)}
                                                className="hidden"
                                                accept=".pdf,.docx,.doc"
                                            />
                                            {offerFile && (
                                                <div className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                                    <Check className="h-3 w-3" />
                                                    {offerFile.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-0">
                            <Button variant="ghost" onClick={handleClose} className="h-11 font-semibold text-muted-foreground">Cancel</Button>
                            <Button
                                onClick={() => sendMutation.mutate({ expiry_days: expiryDays, hr_name: hrName, hr_email: hrEmail, file: offerFile })}
                                disabled={sendMutation.isPending || !hrName || !hrEmail}
                                className="h-11 px-8 rounded-lg font-bold shadow-md shadow-primary/20"
                            >
                                {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                                Send Access Link
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
