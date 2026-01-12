"use client"

import { useState, useMemo, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
    Loader2, 
    Plus, 
    Calendar as CalendarIcon, 
    Upload, 
    Info, 
    AlertCircle, 
    X, 
    FileIcon,
    ArrowRight
} from "lucide-react"
import { format, parseISO, isSaturday, isSunday } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SimpleDialog } from "@/components/ui/simple-dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { LeaveType, LeaveApplication } from "@/types/leave"
import { cn, fileToBase64 } from "@/lib/utils"
import { useLeaveTypes, useApplyLeave, useUpdateLeave, useMyLeaveBalances, usePublicHolidays } from "../hooks/use-leaves"
import { calculateWorkingDays } from "@/lib/leave-utils"

const leaveFormSchema = z.object({
    leave_type_id: z.coerce.number().min(1, "Please select a leave type"),
    from_date: z.date({ required_error: "Start date is required" }),
    to_date: z.date().optional().nullable(),
    duration_type: z.enum(["Full Day", "Half Day", "Multiple Days"]),
    reason: z.string().min(5, "Reason must be at least 5 characters"),
    contact_phone: z.string().optional(),
    contact_email: z.string().email("Invalid email format").optional().or(z.literal("")),
    attachment: z.string().optional(),
}).refine((data) => {
    if (data.duration_type === "Multiple Days" && !data.to_date) {
        return false;
    }
    return true;
}, {
    message: "End date is required for multiple days",
    path: ["to_date"],
}).refine((data) => {
    if (data.duration_type === "Multiple Days" && data.to_date && data.to_date < data.from_date) {
        return false;
    }
    return true;
}, {
    message: "End date cannot be before start date",
    path: ["to_date"],
});

type LeaveFormValues = z.infer<typeof leaveFormSchema>

interface ApplyLeaveDialogProps {
    application?: LeaveApplication;
    trigger?: React.ReactNode;
}

export function ApplyLeaveDialog({ application, trigger }: ApplyLeaveDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const { data: leaveTypes } = useLeaveTypes()
    const { data: balances } = useMyLeaveBalances()
    const { data: holidays } = usePublicHolidays(new Date().getFullYear())
    const { mutate: applyLeave, isPending: isApplying } = useApplyLeave()
    const { mutate: updateLeave, isPending: isUpdating } = useUpdateLeave()

    const isEditing = !!application
    const isPending = isApplying || isUpdating

    const form = useForm<LeaveFormValues>({
        resolver: zodResolver(leaveFormSchema),
        defaultValues: {
            leave_type_id: application?.leave_type_id || undefined,
            duration_type: (application?.duration_type as "Full Day" | "Half Day" | "Multiple Days") || "Full Day",
            reason: application?.reason || "",
            from_date: application?.from_date ? parseISO(application.from_date) : undefined,
            to_date: application?.to_date ? parseISO(application.to_date) : null,
            contact_phone: application?.contact_phone || "",
            contact_email: application?.contact_email || "",
            attachment: application?.attachment || "",
        },
    })

    const watchLeaveTypeId = form.watch("leave_type_id")
    const watchDurationType = form.watch("duration_type")
    const watchFromDate = form.watch("from_date")
    const watchToDate = form.watch("to_date")

    const selectedType = leaveTypes?.find(t => t.id === Number(watchLeaveTypeId))
    const selectedBalance = balances?.find(b => b.leave_type_id === Number(watchLeaveTypeId))

    const calculatedDays = useMemo(() => {
        if (!watchFromDate) return 0
        return calculateWorkingDays(
            watchFromDate,
            watchDurationType === "Multiple Days" ? watchToDate : watchFromDate,
            watchDurationType,
            holidays || []
        )
    }, [watchFromDate, watchToDate, watchDurationType, holidays])

    const isBalanceInsufficient = selectedBalance && !selectedType?.negative_balance_allowed && selectedBalance.available < calculatedDays

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileName(file.name)
            const base64 = await fileToBase64(file)
            form.setValue("attachment", base64)
        }
    }

    const removeFile = () => {
        setFileName(null)
        form.setValue("attachment", "")
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    function onSubmit(data: LeaveFormValues) {
        if (isBalanceInsufficient) return

        const payload = {
            ...data,
            from_date: format(data.from_date, "yyyy-MM-dd"),
            to_date: data.to_date ? format(data.to_date, "yyyy-MM-dd") : format(data.from_date, "yyyy-MM-dd"),
            number_of_days: calculatedDays,
        }

        if (isEditing && application) {
            updateLeave({ id: application.id, data: payload }, {
                onSuccess: () => {
                    setIsOpen(false)
                    setFileName(null)
                }
            })
        } else {
            applyLeave(payload, {
                onSuccess: () => {
                    setIsOpen(false)
                    setFileName(null)
                    form.reset()
                }
            })
        }
    }

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)}>{trigger}</div>
            ) : (
                <Button 
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 px-6 flex items-center gap-2 shadow-sm transition-all rounded-md"
                >
                    <Plus className="h-4 w-4" /> Apply for Leave
                </Button>
            )}
            
            <SimpleDialog 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)} 
                title={isEditing ? "Edit Leave Request" : "Request Leave"}
                description={isEditing ? "Update your leave details below." : "Submit a new leave application for approval."}
                className="max-w-xl"
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Leave Type Selection */}
                            <FormField
                                control={form.control}
                                name="leave_type_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 border-zinc-200">
                                                    <SelectValue placeholder="Select leave type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {leaveTypes?.map((type: LeaveType) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name.replace(/_/g, ' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedBalance && (
                                            <div className="mt-1.5 flex items-center gap-1.5">
                                                <span className="text-[10px] font-medium text-muted-foreground">Available:</span>
                                                <span className="text-[10px] font-bold text-foreground">{selectedBalance.available} Days</span>
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Duration Type */}
                            <FormField
                                control={form.control}
                                name="duration_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10 border-zinc-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Full Day">Full Day</SelectItem>
                                                <SelectItem value="Half Day">Half Day</SelectItem>
                                                <SelectItem value="Multiple Days">Multiple Days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Date Range Selection */}
                        <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="from_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
                                                {watchDurationType === "Multiple Days" ? "From Date" : "Date"}
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "h-10 pl-3 text-left font-normal bg-background border-zinc-200",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => {
                                                            const dateStr = format(date, 'yyyy-MM-dd');
                                                            const isHoliday = holidays?.some(h => h.holiday_date === dateStr);
                                                            const isWeekend = isSaturday(date) || isSunday(date);
                                                            return date < new Date("1900-01-01") || isWeekend || isHoliday;
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {watchDurationType === "Multiple Days" && (
                                    <FormField
                                        control={form.control}
                                        name="to_date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">To Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "h-10 pl-3 text-left font-normal bg-background border-zinc-200",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value || undefined}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => {
                                                                const dateStr = format(date, 'yyyy-MM-dd');
                                                                const isHoliday = holidays?.some(h => h.holiday_date === dateStr);
                                                                const isWeekend = isSaturday(date) || isSunday(date);
                                                                return date < (watchFromDate || new Date()) || isWeekend || isHoliday;
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            {watchFromDate && (
                                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-xs font-medium text-foreground">
                                            Total requested: <span className="font-bold">{calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}</span>
                                        </span>
                                    </div>
                                    {isBalanceInsufficient && (
                                        <div className="flex items-center gap-1 text-rose-600 text-[10px] font-bold uppercase tracking-tight bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                            <AlertCircle className="size-3" />
                                            Balance Exceeded
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Reason & Contact */}
                        <div className="grid grid-cols-1 gap-6">
                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason for Absence</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Explain the reason for your leave request..." 
                                                className="min-h-[80px] bg-background border-zinc-200 focus:ring-1 focus:ring-primary/20" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="contact_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Emergency Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mobile number" className="h-10 bg-background border-zinc-200" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upload Proof</span>
                                    {fileName ? (
                                        <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-md h-10 px-3">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileIcon className="h-4 w-4 text-primary shrink-0" />
                                                <span className="text-xs font-medium truncate max-w-[120px]">{fileName}</span>
                                            </div>
                                            <button type="button" onClick={removeFile} className="text-primary hover:text-rose-600">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative h-10">
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-dashed border-zinc-300 h-10 w-full text-muted-foreground text-xs"
                                            >
                                                <Upload className="h-4 w-4 mr-2" /> Select File
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setIsOpen(false)}
                                className="h-10 px-6 text-sm font-medium text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isPending || isBalanceInsufficient || !watchFromDate}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 text-sm font-bold shadow-md transition-all active:scale-95"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "Update Request" : "Submit Request"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SimpleDialog>
        </>
    )
}
