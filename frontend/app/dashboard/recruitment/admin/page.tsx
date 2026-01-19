"use client"

import { useCandidates } from "@/features/onboarding/hooks/use-onboarding"
import { useDepartments } from "@/hooks/use-master-data"
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
import { Progress } from "@/components/ui/progress"
import {
    Loader2,
    Search,
    Plus,
    MoreVertical,
    Mail,
    ShieldCheck,
    Clock,
    FileText,
    Users,
    Filter,
    AlertCircle
} from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CandidateResponse, CandidateStatus } from "@/types/onboarding"
import { format, parseISO } from "date-fns"
import { SendOfferDialog } from "@/features/onboarding/components/send-offer-dialog"
import { CandidateCreateForm } from "@/features/onboarding/components/candidate-create-form"
import { CandidateReviewDialog } from "@/features/onboarding/components/candidate-review-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useConvertCandidate } from "@/features/onboarding/hooks/use-onboarding"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function RecruitmentDashboard() {
    const { data: candidates, isLoading } = useCandidates()
    const { data: departments } = useDepartments()
    const { toast } = useToast()
    const activateMutation = useConvertCandidate()

    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [deptFilter, setDeptFilter] = useState<string>("all")

    const [selectedCandidate, setSelectedCandidate] = useState<CandidateResponse | null>(null)
    const [offerDialogOpen, setOfferDialogOpen] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

    const filteredCandidates = candidates?.filter(c => {
        const matchesSearch = c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.personal_email.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || c.status === statusFilter
        const matchesDept = deptFilter === "all" || c.department_id.toString() === deptFilter

        return matchesSearch && matchesStatus && matchesDept
    })

    const handleSendOffer = (candidate: CandidateResponse) => {
        setSelectedCandidate(candidate)
        setOfferDialogOpen(true)
    }

    const handleReviewDocs = (candidate: CandidateResponse) => {
        setSelectedCandidate(candidate)
        setReviewDialogOpen(true)
    }

    const handleActivate = (id: number) => {
        if (confirm("Are you sure you want to activate this candidate as an employee? This will create their user account and work email.")) {
            activateMutation.mutate(id, {
                onSuccess: (res) => {
                    toast({
                        title: "Activation Successful",
                        description: `Employee record created successfully.`,
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
            [CandidateStatus.created]: "bg-zinc-100 text-zinc-700 border-zinc-200",
            [CandidateStatus.offer_ready]: "bg-blue-50 text-blue-700 border-blue-200",
            [CandidateStatus.sent]: "bg-amber-50 text-amber-700 border-amber-200",
            [CandidateStatus.accepted]: "bg-emerald-50 text-emerald-700 border-emerald-200",
            [CandidateStatus.rejected]: "bg-rose-50 text-rose-700 border-rose-200",
            [CandidateStatus.negotiating]: "bg-purple-50 text-purple-700 border-purple-200",
            [CandidateStatus.onboarding]: "bg-indigo-50 text-indigo-700 border-indigo-200",
        }
        return (
            <Badge variant="outline" className={cn("capitalize font-bold text-[10px] px-2.5 py-0.5 shadow-none", styles[status])}>
                {status.replace(/_/g, ' ')}
            </Badge>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">Recruitment</h2>
                    <p className="text-muted-foreground font-medium">Manage candidate pipeline and onboarding.</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full h-10 px-6 font-bold shadow-sm active:scale-95 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> New Candidate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-serif">Add New Candidate</DialogTitle>
                            <DialogDescription>Enter candidate details to begin recruitment.</DialogDescription>
                        </DialogHeader>
                        <CandidateCreateForm onSuccess={() => setCreateDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-card border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Active Pipeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-serif font-bold">{candidates?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-amber-600">Offers Sent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-serif font-bold text-amber-700">
                            {candidates?.filter(c => c.status === CandidateStatus.sent).length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Onboarding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-serif font-bold text-emerald-700">
                            {candidates?.filter(c => c.status === CandidateStatus.onboarding || c.status === CandidateStatus.accepted).length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-rose-600">Joining Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-serif font-bold text-rose-700">
                            {candidates?.filter(c => new Date(c.expected_joining_date).getTime() < new Date().getTime() + 7 * 86400000).length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card className="border-border/60 shadow-sm flex flex-col min-h-[500px]">
                <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/5">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9 h-9 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] h-9">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {Object.values(CandidateStatus).map(s => (
                                    <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={deptFilter} onValueChange={setDeptFilter}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Depts</SelectItem>
                                {departments?.items?.map(d => (
                                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[200px]">Candidate</TableHead>
                                <TableHead>Role & Dept</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Blockers</TableHead>
                                <TableHead>Joining Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredCandidates?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        No candidates found matching filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCandidates?.map((candidate) => (
                                    <TableRow key={candidate.id} className="hover:bg-muted/5">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{candidate.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{candidate.personal_email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="secondary" className="w-fit text-[10px] font-normal">
                                                    ID: {candidate.designation_id}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Dept: {departments?.items?.find(d => d.id === candidate.department_id)?.name || candidate.department_id}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(candidate.status)}
                                        </TableCell>
                                        <TableCell className="w-[120px]">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                                                    <span>{Math.round(candidate.onboarding_progress)}%</span>
                                                </div>
                                                <Progress value={candidate.onboarding_progress} className="h-1.5" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[150px]">
                                            {candidate.missing_required_items?.length > 0 ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium cursor-help">
                                                                <AlertCircle className="h-3.5 w-3.5" />
                                                                {candidate.missing_required_items.length} Pending
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="font-bold text-[10px] uppercase tracking-wider mb-1">Missing Items:</p>
                                                            <ul className="list-disc pl-4 text-xs space-y-0.5">
                                                                {candidate.missing_required_items.slice(0, 5).map((item, i) => (
                                                                    <li key={i}>{item}</li>
                                                                ))}
                                                                {candidate.missing_required_items.length > 5 && (
                                                                    <li>+ {candidate.missing_required_items.length - 5} more</li>
                                                                )}
                                                            </ul>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                                    <ShieldCheck className="h-3.5 w-3.5" /> Ready
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{format(parseISO(candidate.expected_joining_date), 'MMM d, yyyy')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {candidate.status === CandidateStatus.created && (
                                                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleSendOffer(candidate)}>
                                                        <Mail className="h-3.5 w-3.5 mr-2" /> Offer
                                                    </Button>
                                                )}

                                                {(candidate.status === CandidateStatus.accepted || candidate.status === CandidateStatus.onboarding) && (
                                                    <>
                                                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleReviewDocs(candidate)}>
                                                            <FileText className="h-3.5 w-3.5 mr-2" /> Docs
                                                        </Button>
                                                        {candidate.status === CandidateStatus.accepted && (
                                                            <Button size="sm" className="h-8 text-xs" onClick={() => handleActivate(candidate.id)} disabled={activateMutation.isPending}>
                                                                {activateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 mr-2" />}
                                                                Activate
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {selectedCandidate && (
                <SendOfferDialog
                    candidate={selectedCandidate}
                    open={offerDialogOpen}
                    onOpenChange={setOfferDialogOpen}
                />
            )}

            {selectedCandidate && (
                <CandidateReviewDialog
                    candidate={selectedCandidate}
                    open={reviewDialogOpen}
                    onOpenChange={setReviewDialogOpen}
                />
            )}
        </div>
    )
}
