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
import { useDepartments, useDesignations, useEmploymentTypes } from "@/hooks/use-master-data"
import { useEmployees } from "@/hooks/use-employee"
import { Loader2, UserPlus, Calendar as CalendarIcon, IndianRupee } from "lucide-react"
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
    work_location: z.string().default("Office"),
    notes: z.string().optional()
})

export function CandidateCreateForm({ onSuccess }: { onSuccess?: () => void }) {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const { data: departments } = useDepartments()
    const { data: designations } = useDesignations()
    const { data: employees } = useEmployees({ limit: 1000 })

    const form = useForm<z.infer<typeof candidateSchema>>({
        resolver: zodResolver(candidateSchema),
        defaultValues: {
            full_name: "",
            personal_email: "",
            mobile_number: "",
            employment_type: "Full-time",
            work_location: "Office",
            notes: ""
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
        }
    })

    const onSubmit = (data: z.infer<typeof candidateSchema>) => {
        createMutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-4 w-1 bg-primary rounded-full" />
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Profile Identity</h4>
                        </div>
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Full Legal Name</FormLabel>
                                    <FormControl><Input placeholder="Rahul Sharma" className="h-11 bg-zinc-50 border-zinc-200" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="personal_email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Personal Email</FormLabel>
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Mobile Number</FormLabel>
                                        <FormControl><Input placeholder="9876543210" className="h-11 bg-zinc-50 border-zinc-200" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Employment Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-4 w-1 bg-blue-500 rounded-full" />
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Placement Details</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="designation_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Designation</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                            <FormControl><SelectTrigger className="h-11 bg-zinc-50"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                            <SelectContent>{designations?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                            <FormControl><SelectTrigger className="h-11 bg-zinc-50"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                            <SelectContent>{departments?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="reporting_manager_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Reporting Manager</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                        <FormControl><SelectTrigger className="h-11 bg-zinc-50"><SelectValue placeholder="Assign manager" /></SelectTrigger></FormControl>
                                        <SelectContent>{employees?.items.filter(e => ["manager", "hr_admin", "super_admin"].includes(e.role)).map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.full_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Schedule & Pay */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Schedule & Compensation</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="expected_joining_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Joining Date</FormLabel>
                                        <FormControl><Input type="date" className="h-11 bg-zinc-50 border-zinc-200" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ctc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Annual CTC (INR)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                                                <Input type="number" placeholder="800000" className="h-11 pl-10 bg-zinc-50 border-zinc-200" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-4 w-1 bg-amber-500 rounded-full" />
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Notes & Internal Info</h4>
                        </div>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-zinc-500">Recruiter Notes</FormLabel>
                                    <FormControl><Input placeholder="Background check status, referral notes..." className="h-11 bg-zinc-50 border-zinc-200" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-zinc-100">
                    <Button type="button" variant="ghost" className="h-12 px-8 font-bold text-[10px] uppercase tracking-widest text-zinc-500">Discard</Button>
                    <Button 
                        type="submit" 
                        disabled={createMutation.isPending}
                        className="h-12 px-12 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                        {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        Onboard Candidate
                    </Button>
                </div>
            </form>
        </Form>
    )
}
