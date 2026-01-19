"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, FileText, Upload, AlertCircle, ArrowRight, LogOut } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { cn, getFileUrl, getPhotoUrl } from "@/lib/utils"
import { useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { usePortalData, useRespondOffer, useUploadOnboardingDoc } from "@/features/onboarding/hooks/use-onboarding"
import Image from "next/image"
import Link from "next/link"

export default function CandidatePortalPage() {
    const params = useParams()
    const token = params.token as string
    const { data, isLoading, error } = usePortalData(token)
    const { toast } = useToast()
    const respondMutation = useRespondOffer(token)
    const uploadMutation = useUploadOnboardingDoc(token)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)

    const [isAccepting, setIsAccepting] = useState(false)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-serif font-bold">Invalid or Expired Link</h1>
                <p className="text-muted-foreground max-w-md">The onboarding link you used is either incorrect or has expired. Please contact HR for a new link.</p>
                <Button onClick={() => window.location.href = "/"}>Return Home</Button>
            </div>
        )
    }

    const { candidate, checklist } = data
    const completedTasks = checklist.filter(t => t.status === "completed").length
    const totalTasks = checklist.length
    const progress = (completedTasks / totalTasks) * 100

    const handleOfferResponse = (action: "accept" | "reject") => {
        respondMutation.mutate({ action }, {
            onSuccess: () => {
                toast({ title: action === "accept" ? "Offer Accepted" : "Offer Rejected" })
            }
        })
    }

    const handleUploadClick = (taskId: number) => {
        setSelectedTaskId(taskId)
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && selectedTaskId) {
            uploadMutation.mutate({ taskId: selectedTaskId, file }, {
                onSuccess: () => {
                    toast({ title: "Upload Success", description: "Document has been received." })
                },
                onError: (err: any) => {
                    toast({ title: "Upload Failed", description: err.message, variant: "destructive" })
                }
            })
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }



    const offerDocPath = candidate.salary_structure?.offer_document

    return (
        <div className="min-h-screen bg-zinc-50/50">
            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.docx"
            />
            <header className="h-16 border-b bg-white flex items-center px-6 lg:px-12 justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    {!data.logo_url ? (
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                            {data.company_name.substring(0, 1)}
                        </div>) : (
                        <div className="flex items-center gap-2">
                            <Image width={100} height={100} src={getPhotoUrl(data.logo_url) || ""} alt={data.company_name} className="h-auto w-[80px] object-contain" />
                            {/* <span className="font-bold text-lg tracking-tight">{data.company_name}</span> */}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-bold text-foreground">{candidate.full_name}</span>
                        <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Candidate ID: #{candidate.id}</span>
                    </div>

                </div>
            </header>

            <main className="max-w-6xl mx-auto py-12 px-6 space-y-10">
                {/* Hero / Progress */}
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to {data.company_name}, {candidate.full_name.split(' ')[0]}!</h1>
                        <p className="text-muted-foreground text-lg">Your journey with us starts here. Please complete the steps below.</p>
                    </div>

                    <Card className="bg-white border-none shadow-sm overflow-hidden">
                        <CardContent className="p-6 md:p-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Onboarding Completion</span>
                                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-3" />
                            <div className="flex gap-4 pt-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> {completedTasks} Tasks Done
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
                                    <FileText className="h-3.5 w-3.5" /> {totalTasks - completedTasks} Pending
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Offer Letter Section (Sticky if not accepted) */}
                {candidate.status === "sent" && (
                    <Card className="border-2 border-primary/20 bg-primary/[0.02] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <CardHeader className="bg-white border-b p-6 md:p-8">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl font-bold text-foreground">Review Your Offer Letter</CardTitle>
                                <Badge className="bg-primary/10 text-primary border-none font-bold px-4 py-1.5 rounded-full uppercase tracking-tighter text-xs">Action Required</Badge>
                            </div>
                            <CardDescription className="text-base pt-2">Please read the terms and conditions carefully before accepting.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[500px] bg-zinc-100 flex items-center justify-center border-b">
                                <div className="text-center space-y-4">
                                    <FileText className="h-16 w-12 text-zinc-400 mx-auto" />
                                    <p className="text-sm font-medium text-zinc-500">Offer Letter Preview</p>
                                    {offerDocPath ? (
                                        <Button variant="outline" className="rounded-full font-bold" asChild>
                                            <Link href={getFileUrl(offerDocPath)} target="_blank" rel="noopener noreferrer">
                                                Download Copy
                                            </Link>
                                        </Button>
                                    ) : (
                                        <p className="text-xs text-destructive">Offer document not available</p>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-4 justify-end bg-white">
                                <Button
                                    variant="ghost"
                                    className="text-destructive font-bold uppercase tracking-widest text-xs px-8 h-12"
                                    onClick={() => handleOfferResponse("reject")}
                                >
                                    Decline Offer
                                </Button>
                                <Button
                                    className="rounded-xl h-12 px-12 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                                    onClick={() => handleOfferResponse("accept")}
                                    disabled={respondMutation.isPending}
                                >
                                    {respondMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Accept & Start Onboarding"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Checklist Section */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-foreground border-b pb-4">Onboarding Checklist</h3>

                    <div className=" space-y-10">
                        {checklist.map((task) => (
                            <Card key={task.id} className={cn(
                                "border shadow-none transition-all group",
                                task.status === "completed" ? "bg-emerald-50/10 border-emerald-100" : "hover:border-primary/20"
                            )}>
                                <CardContent className="p-0">
                                    <div className="flex items-center p-6 gap-6">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                                            task.status === "completed"
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm"
                                                : "bg-white border-zinc-200 text-zinc-400"
                                        )}>
                                            {task.status === "completed" ? <CheckCircle2 className="h-6 w-6" /> : <Upload className="h-5 w-5" />}
                                        </div>

                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm tracking-tight text-foreground">{task.name}</h4>
                                                {task.required && task.status === "pending" && (
                                                    <span className="text-[10px] bg-red-50 text-red-600 font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Required</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 font-medium uppercase tracking-widest">{task.category}</p>
                                        </div>

                                        <div className="shrink-0">
                                            {task.status !== "completed" && (
                                                <Button
                                                    size="sm"
                                                    className="rounded-lg px-6 font-bold text-xs uppercase tracking-widest shadow-sm active:scale-95"
                                                    disabled={candidate.status === "sent"} // Disable tasks until offer accepted
                                                    onClick={() => handleUploadClick(task.id)}
                                                >
                                                    Upload File
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="pt-12 border-t text-center space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        LeadTap Digi Solutions LLP ensures compliance with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. Your data is encrypted and handled only by authorized personnel.
                    </p>
                    <div className="flex items-center justify-center gap-2 opacity-20 select-none grayscale">
                        {/* Fallback footer logo simply text or icon if needed, but keeping it minimal */}
                        <span className="font-bold text-sm">{data.company_name}</span>
                    </div>
                </div>
            </main>
        </div>
    )
}
