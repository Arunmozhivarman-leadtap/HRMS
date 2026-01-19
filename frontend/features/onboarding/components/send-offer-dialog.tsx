"use client"

import { useState } from "react"
import { SimpleDialog } from "@/components/ui/simple-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, FileText, Calendar as CalendarIcon, Link2, Copy, Check } from "lucide-react"
import { CandidateResponse } from "@/types/onboarding"

export function SendOfferDialog({ candidate, open, onOpenChange }: { candidate: CandidateResponse, open: boolean, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const [expiryDays, setExpiryDays] = useState(7)
    const [offerFile, setOfferFile] = useState<File | null>(null)
    const [offerLink, setOfferLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const sendMutation = useMutation({
        mutationFn: async (data: { expiry_days: number, file: File | null }) => {
            const formData = new FormData()
            formData.append("expiry_days", data.expiry_days.toString())
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

    return (
        <SimpleDialog
            isOpen={open}
            onClose={() => {
                onOpenChange(false)
                setOfferLink(null)
            }}
            title="Prepare Offer Letter"
            description={`Generating a secure onboarding link for ${candidate.full_name}.`}
            className="max-w-md p-5"
        >
            <div className="space-y-6 pt-4">
                {offerLink ? (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center text-center gap-4">
                            <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-serif font-bold text-lg text-emerald-900">Offer Sent!</h4>
                                <p className="text-xs text-emerald-700/80 font-medium">An automated email has been sent to {candidate.personal_email}.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Manual Access Link</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-zinc-50 border rounded-xl px-4 h-11 flex items-center overflow-hidden">
                                    <span className="text-xs font-mono text-zinc-500 truncate">{window.location.origin}{offerLink}</span>
                                </div>
                                <Button size="icon" variant="outline" className="rounded-xl h-11 w-11 shrink-0" onClick={handleCopy}>
                                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <Button className="w-full h-12 rounded-xl font-bold" onClick={() => onOpenChange(false)}>Close Control</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-zinc-50 p-4 rounded-xl border space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground font-medium uppercase tracking-widest">Candidate</span>
                                <span className="font-bold text-foreground">{candidate.full_name}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground font-medium uppercase tracking-widest">Email</span>
                                <span className="font-bold text-foreground">{candidate.personal_email}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Link Expiry (Days)</Label>
                            <div className="flex items-center gap-4">
                                <Input 
                                    type="number" 
                                    value={expiryDays} 
                                    onChange={(e) => setExpiryDays(parseInt(e.target.value))} 
                                    className="h-11 rounded-xl bg-zinc-50 font-bold"
                                />
                                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 shrink-0">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>Expires: {new Date(Date.now() + expiryDays * 86400000).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Offer Letter (PDF/DOCX)</Label>
                            <Input 
                                type="file" 
                                onChange={(e) => setOfferFile(e.target.files?.[0] || null)}
                                className="h-11 rounded-xl bg-zinc-50 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700 file:font-bold file:border-none file:mr-4 file:text-xs"
                                accept=".pdf,.docx,.doc"
                            />
                        </div>

                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3">
                            <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                            <p className="text-[11px] text-blue-800 leading-relaxed font-medium">Upload the signed offer letter. The candidate will be able to view and download this before accepting.</p>
                        </div>

                        <Button 
                            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                            onClick={() => sendMutation.mutate({ expiry_days: expiryDays, file: offerFile })}
                            disabled={sendMutation.isPending || !offerFile}
                        >
                            {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                            Send Offer Link
                        </Button>
                    </div>
                )}
            </div>
        </SimpleDialog>
    )
}
