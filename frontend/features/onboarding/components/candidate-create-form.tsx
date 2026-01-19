"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"


import { useDepartments, useDesignations, useEmploymentTypes } from "@/hooks/use-master-data"
import { useEmployees } from "@/hooks/use-employee"
import { Loader2, UserPlus, Calendar as CalendarIcon, IndianRupee, Briefcase, Coins, FileText } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { fetcher } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const candidateSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    personal_email: z.string().email("Invalid email"),
    mobile_number: z.string().length(10, "Must be a 10-digit number"),
    designation_id: z.coerce.number().min(1, "Required"),
    department_id: z.coerce.number().min(1, "Required"),
    reporting_manager_id: z.coerce.number().min(1, "Required"),
    employment_type: z.string().min(1, "Required"),
    expected_joining_date: z.string().min(1, "Required"),
    ctc: z.coerce.number().min(0).optional(),
    notes: z.string().optional()
})

export function CandidateCreateForm({ onSuccess }: { onSuccess?: () => void }) {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const { data: departments } = useDepartments()
    const { data: designations } = useDesignations()
    const { data: employees } = useEmployees({ limit: 1000 })

    const form = useForm({
        resolver: zodResolver(candidateSchema),
        defaultValues: {
            full_name: "",
            personal_email: "",
            mobile_number: "",
            employment_type: "Full-time",
            notes: "",
            designation_id: 0,
            department_id: 0,
            reporting_manager_id: 0,
            expected_joining_date: "",
            ctc: 0
        }
    })

    const createMutation = useMutation({
        mutationFn: (data: any) => fetcher("/onboarding/candidates", {
            method: "POST",
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["candidates"] })
            toast({ title: "Candidate Created", description: "Offer preparation can now begin." })
            onSuccess?.()
        },
        onError: (error: any) => {
            // Check for specific email duplicate error
            if (error?.status === 400 && error?.message?.toLowerCase().includes("email already exists")) {
                form.setError("personal_email", {
                    type: "manual",
                    message: "This email is already registered."
                })
                toast({
                    variant: "destructive",
                    title: "Duplicate Candidate",
                    description: "A candidate with this email address already exists."
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Error Creating Candidate",
                    description: error?.message || "An unexpected error occurred."
                })
            }
        }
    })

    const onSubmit = (data: z.infer<typeof candidateSchema>) => {
        createMutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 h-full">
                {/* Left Column: Primary Information */}
                <div className="lg:col-span-8 p-6 md:p-8 space-y-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                            <UserPlus className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-semibold text-foreground">Personal Information</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Legal Name</FormLabel>
                                        <FormControl><Input placeholder="Rahul Sharma" className="h-11 bg-zinc-50 border-zinc-200" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="personal_email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Email</FormLabel>
                                        <FormControl><Input placeholder="rahul@example.com" className="h-11 bg-zinc-50 border-zinc-200" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mobile_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile Number</FormLabel>
                                        <FormControl><Input placeholder="9876543210" className="h-11 bg-zinc-50 border-zinc-200" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Role & Placement */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <h4 className="text-sm font-semibold text-foreground">Role & Placement</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="designation_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Designation</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                            <FormControl><SelectTrigger className="h-11 bg-zinc-50 border-zinc-200"><SelectValue placeholder="Select role" /></SelectTrigger></FormControl>
                                            <SelectContent>{designations?.items.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="department_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                            <FormControl><SelectTrigger className="h-11 bg-zinc-50 border-zinc-200"><SelectValue placeholder="Select dept" /></SelectTrigger></FormControl>
                                            <SelectContent>{departments?.items.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reporting_manager_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reporting Manager</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                            <FormControl><SelectTrigger className="h-11 bg-zinc-50 border-zinc-200"><SelectValue placeholder="Select manager" /></SelectTrigger></FormControl>
                                            <SelectContent>{employees?.items.filter(e => ["manager", "hr_admin", "super_admin"].includes(e.role)).map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.full_name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="employment_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employment Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="h-11 bg-zinc-50 border-zinc-200"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Full-time">Full-time</SelectItem>
                                                <SelectItem value="Contract">Contract</SelectItem>
                                                <SelectItem value="Internship">Internship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Offer & Summary Sidebar */}
                <div className="lg:col-span-4 bg-zinc-50/50 border-t lg:border-t-0 lg:border-l border-zinc-200 p-6 flex flex-col gap-8">
                    {/* Offer Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                            <Coins className="h-4 w-4 text-amber-600" />
                            <h4 className="text-sm font-semibold text-foreground">Offer Details</h4>
                        </div>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="expected_joining_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joining Date</FormLabel>
                                        <FormControl><Input type="date" className="h-11 bg-white border-zinc-200" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ctc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Annual CTC</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                                <Input type="number" placeholder="800000" className="h-11 pl-10 bg-white border-zinc-200" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                            <FileText className="h-4 w-4 text-indigo-600" />
                            <h4 className="text-sm font-semibold text-foreground">Internal Notes</h4>
                        </div>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-[120px] bg-white border-zinc-200 resize-none"
                                            placeholder="Referral info, background check status..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="mt-auto pt-6 flex flex-col gap-3">
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="h-12 w-full rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            Create Candidate
                        </Button>
                        <Button type="button" variant="ghost" className="h-10 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Discard Draft</Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
