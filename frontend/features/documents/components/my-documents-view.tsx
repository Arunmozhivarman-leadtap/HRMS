"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    Trash2,
    FileText,
    AlertCircle,
    CheckCircle2,
    Plus,
    Upload,
    AlertTriangle,
    FileDown,
    Calendar as CalendarIcon,
    X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"

type DocumentType =
    | "aadhaar_card" | "pan_card" | "passport" | "voter_id" | "driving_licence"
    | "cancelled_cheque" | "10th_marksheet" | "12th_marksheet"
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

export function MyDocumentsView() {
    const { toast } = useToast()
    const { user } = useUser()
    const queryClient = useQueryClient()

    const [uploadingType, setUploadingType] = useState<string | null>(null)
    const [expiryDates, setExpiryDates] = useState<Record<string, string>>({})

    const { data: documentsResponse, isLoading } = useQuery<any>({
        queryKey: ["my-documents", user?.employee_id],
        queryFn: () => fetcher(`/documents/list?limit=100${user?.employee_id ? `&employee_id=${user.employee_id}` : ''}`),
        enabled: !!user?.employee_id
    })

    const documents = documentsResponse?.items || []

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
        },
        onError: (err: any) => {
            const message = typeof err.message === 'string' ? err.message : "Upload failed"
            toast({ title: "Upload Failed", description: message, variant: "destructive" })
            setUploadingType(null)
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => fetcher(`/documents/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-documents"] })
            toast({ title: "Deleted", description: "Document removed successfully" })
        },
        onError: (err: any) => {
            const message = typeof err.message === 'string' ? err.message : "Delete failed"
            toast({ title: "Error", description: message, variant: "destructive" })
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
                                    const matchingDocs = documents?.filter((d: DocumentResponse) => d.document_type === item.type) || []
                                    const hasDocs = matchingDocs.length > 0
                                    const isItemUploading = uploadingType === item.type

                                    return (
                                        <Card key={item.type} className="bg-background border shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row p-5 lg:p-6 gap-6 lg:gap-8">
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
                                                            </p>

                                                            {!hasDocs && (
                                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60 w-fit">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    <span>Not Uploaded</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[300px] md:pl-6 lg:pl-8">
                                                        <div className="flex items-center justify-end gap-4">
                                                            {(!hasDocs || (item as any).allowMultiple) && (
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

                                                        {hasDocs && (
                                                            <div className="space-y-1">
                                                                {matchingDocs.map((doc: DocumentResponse) => (
                                                                    <div key={doc.id} className="group relative flex flex-col py-3 border-b border-border/40 last:border-0 transition-all">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-3 justify-end flex-1 min-w-0">
                                                                                <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight", getStatusColorClass(doc.verification_status))}>
                                                                                    {getStatusLabel(doc.verification_status)}
                                                                                </div>
                                                                                {doc.expiry_date && (
                                                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Exp: {doc.expiry_date}</span>
                                                                                )}
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
