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
    ArrowRight,

} from "lucide-react"
import { format, parseISO, isSaturday, isSunday, addDays } from "date-fns"

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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const leaveFormSchema = z.object({
    leave_type_id: z.coerce.number().min(1, "Please select a leave type"),
    from_date: z.date({ required_error: "Start date is required" })
        .min(new Date(new Date().setHours(0, 0, 0, 0)), "Start date cannot be in the past"),
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
            watchDurationType === "Multiple Days" ? (watchToDate ?? null) : watchFromDate,
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

        if (selectedType?.requires_document && !data.attachment) {
            form.setError("attachment", {
                type: "manual",
                message: `Supporting document is required for ${selectedType.name.replace(/_/g, ' ')}`
            })
            return
        }

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

    const isDateDisabled = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const isHoliday = holidays?.some(h => h.holiday_date === dateStr) || false;
        const isWeekend = isSaturday(date) || isSunday(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today || isWeekend || isHoliday;
    }

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)}>{trigger}</div>
            ) : (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all rounded-lg font-medium px-6"
                >
                    <Plus className="h-4 w-4 mr-2" /> Apply Leave
                </Button>
            )}

            <SimpleDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={isEditing ? "Edit Leave Request" : "New Leave Request"}
                description="Complete the form below to submit your leave application."
                className="max-w-5xl sm:max-w-5xl p-5 overflow-hidden gap-0 w-full sm:w-[95vw]"
            >
                <div className="flex flex-col h-full bg-zinc-50/30">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                            <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                                {/* Left Column: Primary Inputs */}
                                <div className="lg:col-span-7 p-6 md:p-8 space-y-8 bg-white border-b lg:border-b-0 lg:border-r border-zinc-100">
                                    {/* Leave Type & Duration */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="leave_type_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger className="mt-1.5 h-11 bg-zinc-50 border-zinc-200 focus:ring-primary/20 transition-all font-medium">
                                                                <SelectValue placeholder="Select type" />
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
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="duration_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="mt-1.5 h-11 bg-zinc-50 border-zinc-200 focus:ring-primary/20 transition-all font-medium">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Full Day">Full Day (1 Day)</SelectItem>
                                                            <SelectItem value="Half Day">Half Day (0.5 Day)</SelectItem>
                                                            <SelectItem value="Multiple Days">Multiple Days</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator className="bg-zinc-100" />

                                    {/* Date Selection */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-primary" />
                                            <h4 className="text-sm font-semibold text-foreground">Date Schedule</h4>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="from_date"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="text-xs font-medium text-muted-foreground mb-1.5">
                                                            {watchDurationType === "Multiple Days" ? "Start Date" : "Date"}
                                                        </FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "h-11 pl-4 w-full text-left font-normal bg-zinc-50 border-zinc-200 hover:bg-zinc-100 transition-colors",
                                                                            !field.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value}
                                                                    onSelect={field.onChange}
                                                                    disabled={isDateDisabled}
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
                                                            <FormLabel className="text-xs font-medium text-muted-foreground mb-1.5">End Date</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant="outline"
                                                                            className={cn(
                                                                                "h-11 pl-4 w-full text-left font-normal bg-zinc-50 border-zinc-200 hover:bg-zinc-100 transition-colors",
                                                                                !field.value && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value || undefined}
                                                                        onSelect={field.onChange}
                                                                        disabled={(date) => isDateDisabled(date) || (watchFromDate ? date < watchFromDate : false)}
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
                                    </div>

                                    <Separator className="bg-zinc-100" />

                                    {/* Reason */}
                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason for Leave</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Please detail the reason for your request..."
                                                        className="min-h-[120px] bg-zinc-50 border-zinc-200 focus:ring-primary/20 resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Right Column: Context & Summary */}
                                <div className="lg:col-span-5 p-6 md:p-8 bg-zinc-50/50 flex flex-col gap-6">

                                    {/* Balance Card */}
                                    <div className="bg-white rounded-xl p-5 border border-zinc-200/60 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Balance Status</span>
                                            {selectedBalance && (
                                                <Badge variant={selectedBalance.available > 0 ? "outline" : "destructive"}>
                                                    {selectedBalance.available} Available
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Requested Duration</span>
                                                <span className="font-semibold text-foreground">{calculatedDays} Days</span>
                                            </div>

                                            {selectedBalance && (
                                                <>
                                                    <Separator className="bg-zinc-100" />
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Remaining after</span>
                                                        <span className={cn(
                                                            "font-bold",
                                                            (selectedBalance.available - calculatedDays) < 0 ? "text-rose-600" : "text-emerald-600"
                                                        )}>
                                                            {selectedBalance.available - calculatedDays} Days
                                                        </span>
                                                    </div>
                                                </>
                                            )}

                                            {isBalanceInsufficient && (
                                                <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-md mt-2">
                                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                    <p>You do not have enough leave balance for this request.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Attachments */}
                                    <div className="space-y-3">
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Attachment {selectedType?.requires_document && <span className="text-destructive">*</span>}
                                        </FormLabel>

                                        {fileName ? (
                                            <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg p-3 shadow-sm">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <FileIcon className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-sm font-medium truncate text-foreground">{fileName}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">Ready to upload</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={removeFile}
                                                    className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-zinc-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                            >
                                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                                <div className="size-10 rounded-full bg-zinc-100 group-hover:bg-white flex items-center justify-center transition-colors">
                                                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-medium text-foreground">Click to upload document</p>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, JPG, PNG</p>
                                                </div>
                                            </div>
                                        )}

                                        {form.formState.errors.attachment && (
                                            <p className="text-sm font-medium text-destructive">
                                                {form.formState.errors.attachment.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-3">
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact While Away</FormLabel>
                                        <FormField
                                            control={form.control}
                                            name="contact_phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Emergency Phone Number"
                                                            className="h-10 bg-white border-zinc-200"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-white border-t border-zinc-200 flex items-center justify-between mt-auto">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsOpen(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending || isBalanceInsufficient || !watchFromDate}
                                    className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-8 shadow-md"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {isEditing ? "Save Changes" : "Submit Request"}
                                            <ArrowRight className="h-4 w-4 ml-2 opacity-50" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SimpleDialog >
        </>
    )
}
