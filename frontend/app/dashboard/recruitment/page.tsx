"use client"

import { useCandidates } from "../../hooks/use-onboarding"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    Loader2, 
    Search, 
    Plus, 
    MoreVertical, 
    Mail, 
    ArrowRight, 
    ShieldCheck,
    Clock,
    FileText,
    Users
} from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CandidateResponse, CandidateStatus } from "@/types/onboarding"
import { format } from "date-fns"
import { SendOfferDialog } from "@/features/onboarding/components/send-offer-dialog"
import { CandidateCreateForm } from "@/features/onboarding/components/candidate-create-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useConvertCandidate } from "../../hooks/use-onboarding"
import { useToast } from "@/hooks/use-toast"

export default function RecruitmentDashboard() {
    const { data: candidates, isLoading } = useCandidates()
    const { toast } = useToast()
    const activateMutation = useConvertCandidate()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateResponse | null>(null)
    const [offerDialogOpen, setOfferDialogOpen] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    const filteredCandidates = candidates?.filter(c => 
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.personal_email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSendOffer = (candidate: CandidateResponse) => {
        setSelectedCandidate(candidate)
        setOfferDialogOpen(true)
    }

    const handleActivate = (id: number) => {
        if (confirm("Are you sure you want to activate this candidate as an employee? This will create their user account and work email.")) {
            activateMutation.mutate(id, {
                onSuccess: (res) => {
                    toast({ 
                        title: "Activation Successful", 
                        description: `Employee record created. Work email: ${res.email}`,
                        variant: "success"
                    })
                },
                onError: (err: any) => {
                    toast({ 
                        title: "Activation Failed", 
                        description: err.message || "An unexpected error occurred",
                        variant: "destructive"
                    })
                }
            })
        }
    }

    const getStatusBadge = (status: CandidateStatus) => {
        const styles = {
            [CandidateStatus.created]: "bg-zinc-100 text-zinc-700",
            [CandidateStatus.offer_ready]: "bg-blue-100 text-blue-700",
            [CandidateStatus.sent]: "bg-amber-100 text-amber-700",
            [CandidateStatus.accepted]: "bg-emerald-100 text-emerald-700",
            [CandidateStatus.rejected]: "bg-rose-100 text-rose-700",
            [CandidateStatus.negotiating]: "bg-purple-100 text-purple-700",
            [CandidateStatus.onboarding]: "bg-primary text-primary-foreground",
        }
        return (
            <Badge variant="outline" className={cn("capitalize font-bold text-[10px] px-2.5 py-0.5 border-none shadow-none", styles[status])}>
                {status.replace(/_/g, ' ')}
            </Badge>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground">Recruitment</h2>
                    <p className="text-lg text-muted-foreground font-medium">Manage the pre-joining lifecycle of your future staff.</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <Plus className="mr-2 h-4 w-4" /> New Candidate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-serif">Add New Candidate</DialogTitle>
                            <DialogDescription>Enter the candidate's core details to begin the recruitment workflow.</DialogDescription>
                        </DialogHeader>
                        <CandidateCreateForm onSuccess={() => setCreateDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-background border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Active Pipeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">{candidates?.length || 0}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">Potential hires</p>
                    </CardContent>
                </Card>
                <Card className="bg-background border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Offers Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">
                            {candidates?.filter(c => c.status === CandidateStatus.sent).length || 0}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">Waiting for response</p>
                    </CardContent>
                </Card>
                <Card className="bg-background border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Onboarding
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">
                            {candidates?.filter(c => c.status === CandidateStatus.accepted).length || 0}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">Acceptance received</p>
                    </CardContent>
                </Card>
                <Card className="bg-background border shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-rose-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Critical Joiners
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-serif font-medium">
                            {candidates?.filter(c => new Date(c.expected_joining_date).getTime() < new Date().getTime() + 7 * 86400000).length || 0}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">Joining within 7 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Candidates Table */}
            <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
                <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-serif font-medium text-foreground">Candidate Pipeline</CardTitle>
                        <CardDescription>Track offers and onboarding progress.</CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search name or email..."
                            className="pl-10 bg-muted/20 border-none h-10 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                    <div className="overflow-auto max-h-[600px] flex-1">
                        <Table>
                            <TableHeader className="bg-muted/90 backdrop-blur-sm text-muted-foreground [&_th]:font-medium [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider sticky top-0 z-10 shadow-sm">
                                <tr className="border-b border-border/40">
                                    <th className="h-10 px-6 align-middle">Candidate</th>
                                    <th className="h-10 px-6 align-middle">Role & Dept</th>
                                    <th className="h-10 px-6 align-middle">Status</th>
                                    <th className="h-10 px-6 align-middle">Expected Joining</th>
                                    <th className="h-10 px-6 align-middle text-right">Actions</th>
                                </tr>
                            </TableHeader>
                            <TableBody className="divide-y divide-border/40">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="h-60 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/20" />
                                        </td>
                                    </tr>
                                ) : filteredCandidates?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="h-60 text-center text-muted-foreground">
                                            <p className="font-serif text-lg">No candidates found</p>
                                            <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-50">Pipeline is currently empty</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCandidates?.map((candidate) => (
                                        <tr key={candidate.id} className="transition-colors hover:bg-muted/30">
                                            <td className="p-6 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-foreground">{candidate.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">{candidate.personal_email}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-tight">Designation #{candidate.designation_id}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Department #{candidate.department_id}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 align-middle">
                                                {getStatusBadge(candidate.status)}
                                            </td>
                                            <td className="p-6 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{format(parseISO(candidate.expected_joining_date), 'MMM d, yyyy')}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    {candidate.status === CandidateStatus.created && (
                                                        <Button size="sm" variant="outline" className="rounded-full font-bold text-[10px] uppercase tracking-widest" onClick={() => handleSendOffer(candidate)}>
                                                            <Mail className="h-3 w-3 mr-2" /> Send Offer
                                                        </Button>
                                                    )}
                                                    {candidate.status === CandidateStatus.accepted && (
                                                        <Button 
                                                            size="sm" 
                                                            className="rounded-full font-bold text-[10px] uppercase tracking-widest"
                                                            onClick={() => handleActivate(candidate.id)}
                                                            disabled={activateMutation.isPending}
                                                        >
                                                            {activateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <ShieldCheck className="h-3 w-3 mr-2" />}
                                                            Activate Emp
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {selectedCandidate && (
                <SendOfferDialog 
                    candidate={selectedCandidate}
                    open={offerDialogOpen}
                    onOpenChange={setOfferDialogOpen}
                />
            )}
        </div>
    )
}
