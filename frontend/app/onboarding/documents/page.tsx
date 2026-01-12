"use client"

import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, FileText, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"

interface OnboardingTask {
// ... types ...
    id: number
    candidate_id: number
    checklist_item_id: number
    status: "pending" | "completed"
    uploaded_file: string | null
    checklist_item: {
        id: number
        name: string
        category: string
        required: boolean
    }
}

export default function CandidateDocumentsPage() {
    // For prototype, assuming candidate_id 1. In real app, get from session/token
    const candidateId = 1 

    const { data: tasks, isLoading } = useQuery<OnboardingTask[]>({
        queryKey: ["onboarding-tasks", candidateId],
        queryFn: () => fetcher(`/onboarding/tasks/${candidateId}`) // TODO: Need this endpoint
    })

    const completedCount = tasks?.filter(t => t.status === "completed").length || 0
    const totalCount = tasks?.length || 0
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-20">
            <header className="h-16 border-b bg-background flex items-center px-8 justify-between sticky top-0 z-10">
                <Logo className="h-6 w-auto" />
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Onboarding Progress</span>
                    <div className="w-32 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ width: `${progress}%` }} 
                        />
                    </div>
                    <span className="text-xs font-bold font-serif">{Math.round(progress)}%</span>
                </div>
            </header>

            <main className="max-w-3xl mx-auto pt-12 px-6">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-serif font-medium tracking-tight">Complete your profile</h2>
                    <p className="text-muted-foreground mt-2">Please upload the required documents to finalize your onboarding.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                    <div className="space-y-4">
                        {tasks?.map((task) => (
                            <Card key={task.id} className={cn(
                                "border-zinc-200 transition-all group hover:border-primary/20",
                                task.status === "completed" && "bg-emerald-50/10 border-emerald-100"
                            )}>
                                <CardContent className="p-0">
                                    <div className="flex items-center p-6 gap-6">
                                        <div className={cn(
                                            "h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-2",
                                            task.status === "completed" 
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                                                : "bg-background border-zinc-100 text-zinc-400"
                                        )}>
                                            {task.status === "completed" ? <CheckCircle2 className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                                        </div>
                                        
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm tracking-tight">{task.checklist_item.name}</h4>
                                                {task.checklist_item.required && (
                                                    <span className="text-[9px] bg-zinc-100 text-zinc-500 font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Required</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{task.checklist_item.category.replace(/_/g, ' ')}</p>
                                        </div>

                                        <div className="shrink-0">
                                            {task.status === "completed" ? (
                                                <Button variant="ghost" size="sm" className="text-emerald-600 font-bold text-xs uppercase tracking-widest px-4">
                                                    Update
                                                </Button>
                                            ) : (
                                                <Button size="sm" className="rounded-full px-6 font-bold text-xs">
                                                    Upload
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="mt-12 bg-white border border-zinc-200 rounded-2xl p-6 flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <Info className="h-5 w-5" />
                    </div>
                    <div>
                        <h5 className="text-sm font-bold tracking-tight">Security & Compliance</h5>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                            Your documents are encrypted at rest and only accessible by authorized HR personnel. 
                            Supported formats: PDF, PNG, JPG (Max 10MB per file).
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
