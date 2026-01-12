"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    Download,
    Trash2,
    FileText,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    CreditCard,
    Check,
    X,
    Calendar as CalendarIcon,
    Plus,
    Upload,
    Eye,
    RefreshCw,
    AlertTriangle,
    FileDown
} from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import { useEmployeeProfile, useUpdateBankingInfo } from "@/hooks/use-employee"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const bankingSchema = z.object({
    bank_account_holder_name: z.string().min(2, "Name is required"),
    bank_name: z.string().min(1, "Bank name is required"),
    branch_name: z.string().min(1, "Branch name is required"),
    account_number: z.string().min(9, "Valid account number required").max(18),
    confirm_account_number: z.string(),
    ifsc_code: z.string().length(11, "IFSC code must be 11 characters"),
    account_type: z.enum(["Savings", "Current"]),
}).refine((data) => data.account_number === data.confirm_account_number, {
    message: "Account numbers do not match",
    path: ["confirm_account_number"],
})

type DocumentType = 
    | "aadhaar_card" | "pan_card" | "passport" | "voter_id" | "driving_licence"
    | "bank_details" | "cancelled_cheque" | "10th_marksheet" | "12th_marksheet"
    | "degree_certificate" | "provisional_certificate" | "post_graduate_degree"
    | "professional_certifications" | "previous_offer_letters" | "relieving_letter"
    | "experience_letter" | "last_3_payslips" | "form_16" | "appointment_letter"
    | "passport_size_photo" | "address_proof" | "marriage_certificate" | "medical_fitness_certificate"

type VerificationStatus = "pending" | "verified" | "rejected" | "reupload_required" | "expired"

interface DocumentResponse {
    id: number
    employee_id: number
    document_type: DocumentType
    file_path: string
    expiry_date: string | null
    verification_status: VerificationStatus
    notes: string | null
    created_at: string
}

const DOCUMENT_CATEGORIES = [
    {
        name: "Identification Documents",
        description: "Government issued identity proofs",
        items: [
            { type: "aadhaar_card", label: "Aadhaar Card", required: true, hasExpiry: false, allowMultiple: false },
            { type: "pan_card", label: "PAN Card", required: true, hasExpiry: false, allowMultiple: false },
            { type: "passport", label: "Passport", required: false, hasExpiry: true, allowMultiple: false },
            { type: "voter_id", label: "Voter ID", required: false, hasExpiry: false, allowMultiple: false },
            { type: "driving_licence", label: "Driving Licence", required: false, hasExpiry: true, allowMultiple: false },
            { type: "passport_size_photo", label: "Passport Size Photo", required: true, hasExpiry: false, allowMultiple: false },
        ]
    },
    {
        name: "Educational Qualifications",
        description: "Certificates and marksheets",
        items: [
            { type: "10th_marksheet", label: "10th Marksheet", required: true, hasExpiry: false, allowMultiple: false },
            { type: "12th_marksheet", label: "12th Marksheet", required: true, hasExpiry: false, allowMultiple: false },
            { type: "degree_certificate", label: "Degree Certificate", required: true, hasExpiry: false, allowMultiple: false },
            { type: "provisional_certificate", label: "Provisional Certificate", required: false, hasExpiry: false, allowMultiple: false },
            { type: "post_graduate_degree", label: "Post Graduate Degree", required: false, hasExpiry: false, allowMultiple: false },
            { type: "professional_certifications", label: "Professional Certifications", required: false, hasExpiry: false, allowMultiple: true },
        ]
    },
    {
        name: "Financial & Tax",
        description: "Banking and tax related documents",
        items: [
             { type: "bank_info", label: "Bank Account Details", required: false, hasExpiry: false, allowMultiple: false, isStatic: true },
             { type: "cancelled_cheque", label: "Cancelled Cheque", required: true, hasExpiry: false, allowMultiple: false },
             { type: "form_16", label: "Form 16", required: false, hasExpiry: false, allowMultiple: false },
        ]
    },
    {
        name: "Employment History",
        description: "Documents from previous employers",
        items: [
            { type: "previous_offer_letters", label: "Previous Offer Letters", required: false, hasExpiry: false, allowMultiple: true },
            { type: "relieving_letter", label: "Relieving Letters", required: true, hasExpiry: false, allowMultiple: true },
            { type: "experience_letter", label: "Experience Letters", required: false, hasExpiry: false, allowMultiple: true },
            { type: "last_3_payslips", label: "Last 3 Payslips", required: true, hasExpiry: false, allowMultiple: true },
            { type: "appointment_letter", label: "Current Appointment Letter", required: false, hasExpiry: false, allowMultiple: false },
        ]
    },
    {
        name: "Other Documents",
        description: "Personal and medical documents",
        items: [
             { type: "address_proof", label: "Address Proof", required: true, hasExpiry: false, allowMultiple: false },
             { type: "marriage_certificate", label: "Marriage Certificate", required: false, hasExpiry: false, allowMultiple: false },
             { type: "medical_fitness_certificate", label: "Medical Fitness Certificate", required: false, hasExpiry: false, allowMultiple: false },
        ]
    }
]

export default function EmployeeDocumentsPage() {
    const { toast } = useToast()
    const { user } = useUser()
    const { data: profile } = useEmployeeProfile()
    const updateBanking = useUpdateBankingInfo()
    const queryClient = useQueryClient()
    
    const [uploadingType, setUploadingType] = useState<string | null>(null)
    const [isEditingBanking, setIsEditingBanking] = useState(false)
    const [expiryDates, setExpiryDates] = useState<Record<string, string>>({})

    const form = useForm<z.infer<typeof bankingSchema>>({
        resolver: zodResolver(bankingSchema),
        defaultValues: {
            bank_account_holder_name: "",
            bank_name: "",
            branch_name: "",
            account_number: "",
            confirm_account_number: "",
            ifsc_code: "",
            account_type: "Savings",
        }
    })

    useEffect(() => {
        if (profile) {
            form.reset({
                bank_account_holder_name: profile.bank_account_holder_name || "",
                bank_name: profile.bank_name || "",
                branch_name: profile.branch_name || "",
                account_number: profile.account_number || "",
                confirm_account_number: profile.account_number || "",
                ifsc_code: profile.ifsc_code || "",
                account_type: (profile.account_type as "Savings" | "Current") || "Savings",
            })
        }
    }, [profile, form])

    const onBankingSubmit = (values: z.infer<typeof bankingSchema>) => {
        updateBanking.mutate(values, {
            onSuccess: () => {
                toast({ title: "Updated", description: "Banking details saved successfully" })
                setIsEditingBanking(false)
            },
            onError: (err: Error) => {
                toast({ title: "Update Failed", description: err.message, variant: "destructive" })
            }
        })
    }

    const { data: documents, isLoading } = useQuery<DocumentResponse[]>({
        queryKey: ["my-documents"],
        queryFn: () => fetcher("/documents/list")
    })

    const uploadMutation = useMutation({
        mutationFn: async ({ type, file, expiry }: { type: string, file: File, expiry?: string }) => {
            if (!user?.employee_id) throw new Error("Employee profile not found")
            const formData = new FormData()
            formData.append("employee_id", user.employee_id.toString())
            formData.append("document_type", type)
            if (expiry) formData.append("expiry_date", expiry)
            formData.append("files", file)
            
            return fetcher("/documents/upload", {
                method: "POST",
                body: formData,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-documents"] })
            toast({ title: "Success", description: "Document uploaded successfully" })
            setUploadingType(null)
            setExpiryDates(prev => {
                const next = { ...prev }
                return next
            })
        },
        onError: (err: Error) => {
            toast({ title: "Upload Failed", description: err.message, variant: "destructive" })
            setUploadingType(null)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => fetcher(`/documents/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-documents"] })
            toast({ title: "Deleted", description: "Document removed successfully" })
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        }
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string, hasExpiry: boolean) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast({ title: "Size Limit", description: "File exceeds 10MB limit", variant: "destructive" })
                return
            }
            
            const expiry = hasExpiry ? expiryDates[type] : undefined
            if (hasExpiry && !expiry) {
                toast({ title: "Date Required", description: "Please select an expiry date first", variant: "destructive" })
                return
            }

            setUploadingType(type)
            uploadMutation.mutate({ type, file, expiry })
        }
    }

    const getStatusColorClass = (status?: VerificationStatus) => {
        switch (status) {
            case "verified": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "pending": return "bg-amber-50 text-amber-700 border-amber-100";
            case "rejected": return "bg-rose-50 text-rose-700 border-rose-100";
            case "reupload_required": return "bg-blue-50 text-blue-700 border-blue-100";
            case "expired": return "bg-zinc-100 text-zinc-700 border-zinc-200";
            default: return "bg-zinc-50 text-zinc-500 border-zinc-100";
        }
    }

    const getStatusIcon = (status?: VerificationStatus) => {
        switch (status) {
            case "verified": return <CheckCircle2 className="h-3 w-3" />;
            case "pending": return <Clock className="h-3 w-3" />;
            case "rejected": return <XCircle className="h-3 w-3" />;
            case "reupload_required": return <RefreshCw className="h-3 w-3" />;
            case "expired": return <AlertTriangle className="h-3 w-3" />;
            default: return <FileText className="h-3 w-3" />;
        }
    }

    const getStatusLabel = (status?: VerificationStatus) => {
        switch (status) {
            case "verified": return "Verified";
            case "pending": return "Pending Review";
            case "rejected": return "Rejected";
            case "reupload_required": return "Re-upload Required";
            case "expired": return "Expired";
            default: return "Not Uploaded";
        }
    }

    return (
        <div className="space-y-8 pb-24 max-w-6xl">
    

            {isLoading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                </div>
            ) : (
                <div className="space-y-12">
                    {DOCUMENT_CATEGORIES.map((category) => (
                        <div key={category.name} className="space-y-6">
                            <div className="space-y-1">
                                <h4 className="text-lg font-semibold text-foreground">{category.name}</h4>
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                            </div>
                            
                            <div className="grid gap-6">
                                {category.items.map((item) => {
                                    if (item.type === "bank_info") {
                                        const hasData = !!profile?.bank_name;
                                        if (isEditingBanking) {
                                            return (
                                                <Card key={item.type} className="rounded-xl border-primary/20 shadow-md bg-white overflow-hidden">
                                                    <CardContent className="p-0">
                                                        <div className="flex flex-col">
                                                            <div className="p-6 bg-muted/30 border-b border-border/40 flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-lg bg-primary text-white shadow-sm">
                                                                        <CreditCard className="h-4 w-4" />
                                                                    </div>
                                                                    <h4 className="font-bold text-sm tracking-tight">Bank Account Setup</h4>
                                                                </div>
                                                                <Button size="icon" variant="ghost" onClick={() => setIsEditingBanking(false)} className="h-8 w-8">
                                                                    <X className="h-4 w-4 text-muted-foreground" />
                                                                </Button>
                                                            </div>
                                                            <Form {...form}>
                                                                <form onSubmit={form.handleSubmit(onBankingSubmit)} className="p-6 space-y-6">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <FormField control={form.control} name="bank_account_holder_name" render={({ field }) => (<FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Holder</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-zinc-200" /></FormControl><FormMessage /></FormItem>)} />
                                                                        <FormField control={form.control} name="account_type" render={({ field }) => (<FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10 border-zinc-200"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Savings">Savings</SelectItem><SelectItem value="Current">Current</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                                                        <FormField control={form.control} name="bank_name" render={({ field }) => (<FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank Name</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-zinc-200" /></FormControl><FormMessage /></FormItem>)} />
                                                                        <FormField control={form.control} name="branch_name" render={({ field }) => (<FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Branch Name</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-zinc-200" /></FormControl><FormMessage /></FormItem>)} />
                                                                        <FormField control={form.control} name="account_number" render={({ field }) => (<FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Number</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-zinc-200" /></FormControl><FormMessage /></FormItem>)} />
                                                                        <FormField control={form.control} name="confirm_account_number" render={({ field }) => (<FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Account Number</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-zinc-200" /></FormControl><FormMessage /></FormItem>)} />
                                                                        <FormField control={form.control} name="ifsc_code" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">IFSC Code</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-zinc-200" /></FormControl><FormMessage /></FormItem>)} />
                                                                    </div>
                                                                    <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                                                                        <Button type="button" variant="ghost" onClick={() => setIsEditingBanking(false)} className="h-10 px-6 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</Button>
                                                                        <Button type="submit" disabled={updateBanking.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 text-sm font-bold shadow-md transition-all active:scale-95">
                                                                            {updateBanking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Details"}
                                                                        </Button>
                                                                    </div>
                                                                </form>
                                                            </Form>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        }

                                        return (
                                            <Card key={item.type} className="rounded-xl border-zinc-200 shadow-sm bg-card overflow-hidden hover:shadow-md transition-all relative group">
                                                {/* Top accent bar */}
                                                <div className={cn("absolute top-0 left-0 w-full h-1 opacity-80", hasData ? "bg-emerald-500" : "bg-rose-500")} />

                                                <CardContent className="p-0">
                                                    <div className="flex p-5 gap-5 items-start">
                                                        <div className={cn("p-2.5 rounded-lg shrink-0 h-fit mt-0.5", hasData ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-400")}>
                                                            <CreditCard className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-semibold text-sm text-foreground">{item.label}</h4>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">Payroll & Banking Information</p>
                                                                </div>
                                                                <Button variant="outline" size="sm" onClick={() => setIsEditingBanking(true)} className="h-8 text-xs font-medium shadow-sm">
                                                                    {hasData ? "Update Details" : "Add Details"}
                                                                </Button>
                                                            </div>

                                                            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
                                                                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium", hasData ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100")}>
                                                                    {hasData ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                                                    <span>{hasData ? "Active" : "Required"}</span>
                                                                </div>
                                                                {hasData && <span className="text-[10px] text-muted-foreground font-medium">{profile.bank_name} •••• {profile.account_number?.slice(-4)}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    }

                                    const matchingDocs = documents?.filter(d => d.document_type === item.type) || []
                                    const hasDocs = matchingDocs.length > 0
                                    const isMultipleAllowed = item.allowMultiple
                                    const showUpload = !hasDocs || isMultipleAllowed
                                    const isItemUploading = uploadingType === item.type

                                    return (
                                        <Card key={item.type} className="rounded-xl border-zinc-200 shadow-sm bg-card overflow-hidden transition-all hover:border-zinc-300 hover:shadow-md relative group">
                                            {/* Top accent bar */}
                                            <div className={cn("absolute top-0 left-0 w-full h-1 opacity-80",
                                                hasDocs ? "bg-emerald-500" : item.required ? "bg-rose-500" : "bg-blue-500"
                                            )} />

                                            <CardContent className="p-0">
                                                <div className="flex p-5 gap-5 items-start">
                                                    {/* Icon */}
                                                    <div className={cn("p-2.5 rounded-lg shrink-0 h-fit mt-0.5", hasDocs ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-400")}>
                                                        <FileText className="h-5 w-5" />
                                                    </div>

                                                    {/* Main Content */}
                                                    <div className="flex-1 space-y-4">
                                                        {/* Header Row */}
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div>
                                                                <h4 className="font-semibold text-sm text-foreground">{item.label}</h4>
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {item.required ? "Mandatory Document" : "Optional Document"}
                                                                    {item.allowMultiple && " • Multiple files allowed"}
                                                                </p>
                                                            </div>

                                                            {/* Upload Controls - Visible if upload allowed */}
                                                            {showUpload && (
                                                                <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                                                                    {item.hasExpiry && (
                                                                        <div className="relative group">
                                                                            <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                                                                            <input
                                                                                type="date"
                                                                                className="h-8 w-32 pl-8 pr-2 text-[11px] font-medium bg-background border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
                                                                                value={expiryDates[item.type] || ""}
                                                                                onChange={(e) => setExpiryDates(prev => ({ ...prev, [item.type]: e.target.value }))}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="relative">
                                                                        <input
                                                                            type="file"
                                                                            className={cn(
                                                                                "absolute inset-0 opacity-0 z-10 w-full",
                                                                                (item.hasExpiry && !expiryDates[item.type]) ? "cursor-not-allowed" : "cursor-pointer"
                                                                            )}
                                                                            disabled={isItemUploading || (item.hasExpiry && !expiryDates[item.type])}
                                                                            onChange={(e) => handleFileChange(e, item.type, item.hasExpiry)}
                                                                            accept=".pdf,.jpg,.jpeg,.png,.docx"
                                                                        />
                                                                        <Button
                                                                            variant={hasDocs ? "outline" : "default"}
                                                                            size="sm"
                                                                            className={cn(
                                                                                "h-8 text-xs font-medium gap-2 shadow-sm transition-all",
                                                                                !hasDocs && "bg-primary text-primary-foreground hover:bg-primary/90",
                                                                                hasDocs && "border-zinc-200 hover:bg-primary/5 hover:border-primary/20"
                                                                            )}
                                                                            disabled={isItemUploading || (item.hasExpiry && !expiryDates[item.type])}
                                                                        >
                                                                            {isItemUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (hasDocs ? <Plus className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />)}
                                                                            {hasDocs ? "Add File" : "Upload"}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Uploaded Files List */}
                                                        {hasDocs ? (
                                                            <div className="space-y-2 w-full">
                                                                {matchingDocs.map((doc) => {
                                                                    const isVerified = doc.verification_status === "verified";
                                                                    const isPending = doc.verification_status === "pending";
                                                                    const isRejected = doc.verification_status === "rejected";
                                                                    const isExpired = doc.verification_status === "expired";
                                                                    const needsReupload = doc.verification_status === "reupload_required";

                                                                    return (
                                                                        <div key={doc.id} className="group">
                                                                            <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border/50 group-hover:border-border/80 transition-all duration-300 hover:shadow-sm">
                                                                                {/* Status and Document Info */}
                                                                                <div className="flex items-center gap-4 flex-1">
                                                                                    {/* Status Indicator Dot */}
                                                                                    <div className={cn(
                                                                                        "w-2.5 h-2.5 rounded-full shrink-0",
                                                                                        isVerified ? "bg-emerald-500" :
                                                                                        isPending ? "bg-amber-500" :
                                                                                        isRejected ? "bg-rose-500" :
                                                                                        isExpired ? "bg-zinc-500" :
                                                                                        needsReupload ? "bg-blue-500" : "bg-zinc-400"
                                                                                    )} />

                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium", getStatusColorClass(doc.verification_status))}>
                                                                                            {getStatusIcon(doc.verification_status)}
                                                                                            <span>{getStatusLabel(doc.verification_status)}</span>
                                                                                        </div>

                                                                                        {doc.expiry_date && (
                                                                                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium px-2 py-1 bg-muted/50 rounded border border-border/30">
                                                                                                <Clock className="h-3 w-3" />
                                                                                                <span>Expires: {doc.expiry_date}</span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Action Buttons */}
                                                                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-8 w-8 text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all duration-200 rounded-md"
                                                                                        asChild
                                                                                    >
                                                                                        <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer" title="Download document">
                                                                                            <FileDown className="h-4 w-4" />
                                                                                        </a>
                                                                                    </Button>

                                                                                    {doc.verification_status !== "verified" && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-8 w-8 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 rounded-md"
                                                                                            onClick={() => deleteMutation.mutate(doc.id)}
                                                                                            disabled={deleteMutation.isPending}
                                                                                            title="Delete document"
                                                                                        >
                                                                                            {deleteMutation.isPending ? (
                                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                                            ) : (
                                                                                                <Trash2 className="h-4 w-4" />
                                                                                            )}
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            // Empty State / Status Placeholder
                                                            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
                                                                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium", item.required ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-zinc-50 text-zinc-500 border border-zinc-100")}>
                                                                    {item.required ? <AlertCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                                                    <span>{item.required ? "Required" : "Optional"}</span>
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                                    {item.allowMultiple ? "Multiple files allowed" : "Single file required"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}