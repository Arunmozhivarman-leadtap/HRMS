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
            case "verified": return "bg-green-100 text-green-700";
            case "pending": return "bg-orange-100 text-orange-700";
            case "rejected": return "bg-red-100 text-red-700";
            case "reupload_required": return "bg-blue-100 text-blue-700";
            case "expired": return "bg-zinc-100 text-zinc-700";
            default: return "bg-muted text-muted-foreground";
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
        <div className="space-y-8">


            {isLoading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                </div>
            ) : (
                <div className="space-y-12">
                    {DOCUMENT_CATEGORIES.map((category) => (
                        <div key={category.name} className="space-y-6">
                            <div className="flex flex-col gap-1">
                                <h4 className="text-xl font-serif font-medium text-foreground">{category.name}</h4>
                                <p className="text-xs text-muted-foreground">{category.description}</p>
                            </div>

                            <div className="grid gap-6">
                                {category.items.map((item) => {
                                    if (item.type === "bank_info") {
                                        const hasData = !!profile?.bank_name;
                                        if (isEditingBanking) {
                                            return (
                                                <Card key={item.type} className="bg-background border shadow-sm rounded-xl overflow-hidden">
                                                    <div className="p-6 bg-muted/20 border-b border-border/40 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                                <CreditCard className="h-4 w-4" />
                                                            </div>
                                                            <h3 className="font-bold text-[11px] text-muted-foreground tracking-wider uppercase">Bank Account Setup</h3>
                                                        </div>
                                                        <Button size="icon" variant="ghost" onClick={() => setIsEditingBanking(false)} className="h-8 w-8 rounded-full">
                                                            <X className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                    <CardContent className="p-6 lg:p-8">
                                                        <Form {...form}>
                                                            <form onSubmit={form.handleSubmit(onBankingSubmit)} className="space-y-6">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                                    <FormField control={form.control} name="bank_account_holder_name" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Holder</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-border/60 focus:ring-primary/20" /></FormControl><FormMessage /></FormItem>)} />
                                                                    <FormField control={form.control} name="account_type" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10 border-border/60"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Savings">Savings</SelectItem><SelectItem value="Current">Current</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                                                    <FormField control={form.control} name="bank_name" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bank Name</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-border/60" /></FormControl><FormMessage /></FormItem>)} />
                                                                    <FormField control={form.control} name="branch_name" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Branch Name</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-border/60" /></FormControl><FormMessage /></FormItem>)} />
                                                                    <FormField control={form.control} name="account_number" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Number</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-border/60" /></FormControl><FormMessage /></FormItem>)} />
                                                                    <FormField control={form.control} name="confirm_account_number" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirm Account Number</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-border/60" /></FormControl><FormMessage /></FormItem>)} />
                                                                    <FormField control={form.control} name="ifsc_code" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">IFSC Code</FormLabel><FormControl><Input {...field} className="h-10 bg-background border-border/60" /></FormControl><FormMessage /></FormItem>)} />
                                                                </div>
                                                                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                                                                    <Button type="button" variant="ghost" onClick={() => setIsEditingBanking(false)} className="h-10 px-6 rounded-md font-medium transition-all hover:bg-muted text-sm border">Cancel</Button>
                                                                    <Button type="submit" disabled={updateBanking.isPending} className="rounded-md h-10 px-8 font-bold shadow-sm active:scale-95 text-sm">
                                                                        {updateBanking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                                                    </Button>
                                                                </div>
                                                            </form>
                                                        </Form>
                                                    </CardContent>
                                                </Card>
                                            );
                                        }

                                        return (
                                            <Card key={item.type} className="bg-background border shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                                                <CardContent className="p-0">
                                                    <div className="flex p-5 lg:p-6 gap-6 items-center">
                                                        <div className={cn("p-3 rounded-xl shrink-0 transition-colors duration-300", hasData ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50")}>
                                                            <CreditCard className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                            <div className="space-y-1">
                                                                <h4 className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">{item.label}</h4>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5", hasData ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                                                        {hasData ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                                                        <span>{hasData ? "Configured" : "Required"}</span>
                                                                    </div>
                                                                    {hasData && (
                                                                        <span className="text-2xl font-serif font-medium text-foreground">
                                                                            {profile.bank_name} <span className="text-sm font-sans text-muted-foreground font-normal ml-2">••{profile.account_number?.slice(-4)}</span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button variant="outline" size="sm" onClick={() => setIsEditingBanking(true)} className="rounded-md px-6 h-9 font-bold transition-all border shadow-none bg-white">
                                                                {hasData ? "Modify Details" : "Set Up Now"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    }

                                    const matchingDocs = documents?.filter(d => d.document_type === item.type) || []
                                    const hasDocs = matchingDocs.length > 0
                                    const isItemUploading = uploadingType === item.type

                                    return (
                                        <Card key={item.type} className="bg-background border shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row p-5 lg:p-6 gap-6 lg:gap-8">
                                                    {/* Primary Info */}
                                                    <div className="flex items-start gap-5 lg:gap-6 flex-1 min-w-0">
                                                        <div className={cn("p-3 rounded-xl shrink-0 mt-0.5", hasDocs ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50")}>
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="space-y-3 min-w-0 flex-1">
                                                            <div className="flex flex-wrap gap-3 items-center">
                                                                <h4 className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase">{item.label}</h4>
                                                                {item.required && !hasDocs && (
                                                                    <Badge variant="outline" className="h-5 px-2 rounded text-[10px] font-medium bg-red-100 text-red-700 border-none shadow-none">
                                                                        Required
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                {item.required ? "Mandatory for profile verification." : "Optional supporting document."}
                                                                {item.allowMultiple && " Support for multiple uploads."}
                                                            </p>

                                                            {!hasDocs && (
                                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60 w-fit">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    <span>Not Uploaded</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions & List */}
                                                    <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[300px] md:pl-6 lg:pl-8">
                                                        {/* Upload Head */}
                                                        <div className="flex items-center justify-end gap-4">


                                                            {(!hasDocs || item.allowMultiple) && (
                                                                <div className="flex items-center gap-2">
                                                                    {item.hasExpiry && (
                                                                        <div className="relative">
                                                                            <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/60 pointer-events-none" />
                                                                            <input
                                                                                type="date"
                                                                                className="h-8 w-28 pl-7 pr-1 text-[10px] font-bold bg-muted/20 border border-border/40 rounded focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
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
                                                                                "h-8 px-4 rounded font-bold text-[11px] gap-2 transition-all shadow-sm",
                                                                                !hasDocs && "bg-primary text-primary-foreground"
                                                                            )}
                                                                            disabled={isItemUploading || (item.hasExpiry && !expiryDates[item.type])}
                                                                        >
                                                                            {isItemUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : (hasDocs ? <Plus className="h-3 w-3" /> : <Upload className="h-3 w-3" />)}
                                                                            {hasDocs ? "Add" : "Upload"}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Document List */}
                                                        {hasDocs && (
                                                            <div className="space-y-1">
                                                                {matchingDocs.map((doc) => (
                                                                    <div key={doc.id} className="group relative flex flex-col py-3 border-b border-border/40 last:border-0 transition-all">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-3 justify-end flex-1 min-w-0">
                                                                                <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight", getStatusColorClass(doc.verification_status))}>
                                                                                    {getStatusLabel(doc.verification_status)}
                                                                                </div>
                                                                                <div className="flex flex-col min-w-0">
                                                                                    {doc.expiry_date && (
                                                                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Exp: {doc.expiry_date}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center gap-1">
                                                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded text-muted-foreground hover:text-primary" asChild>
                                                                                    <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer">
                                                                                        <FileDown className="h-3.5 w-3.5" />
                                                                                    </a>
                                                                                </Button>

                                                                                {doc.verification_status !== "verified" && (
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-7 w-7 rounded text-muted-foreground hover:text-red-600"
                                                                                        onClick={() => deleteMutation.mutate(doc.id)}
                                                                                        disabled={deleteMutation.isPending}
                                                                                    >
                                                                                        {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Rejection/Re-upload Feedback */}
                                                                        {(doc.verification_status === "rejected" || doc.verification_status === "reupload_required") && doc.notes && (
                                                                            <div className="mt-2 text-xs bg-destructive/5 text-destructive p-3 rounded-md border border-destructive/10 flex items-start gap-2">
                                                                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                                                <div className="flex flex-col gap-0.5">
                                                                                    <span className="font-semibold uppercase text-[10px] tracking-wider opacity-80">HR Feedback</span>
                                                                                    <p className="leading-relaxed">{doc.notes}</p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
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