"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2, Calendar as CalendarIcon, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { SimpleDialog } from "@/components/ui/simple-dialog"
import { useRequestLeaveCredit } from "../hooks/use-leaves"

const creditFormSchema = z.object({
    date_worked: z.date({
        required_error: "Date worked is required",
    }).max(new Date(), "Date cannot be in the future"),
    reason: z.string().min(5, "Reason must be at least 5 characters"),
})

type CreditFormValues = z.infer<typeof creditFormSchema>

interface LeaveCreditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeaveCreditDialog({ open, onOpenChange }: LeaveCreditDialogProps) {
    const { mutate: requestCredit, isPending } = useRequestLeaveCredit()

    const form = useForm<CreditFormValues>({
        resolver: zodResolver(creditFormSchema),
        defaultValues: {
            reason: "",
        },
    })

    function onSubmit(data: CreditFormValues) {
        requestCredit({
            date_worked: format(data.date_worked, "yyyy-MM-dd"),
            reason: data.reason
        }, {
            onSuccess: () => {
                onOpenChange(false)
                form.reset()
            }
        })
    }

    return (
        <SimpleDialog
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title="Request Leave Credit"
            description="Submit a request for compensatory leave credit for working on holidays or weekends."
            className="sm:max-w-[500px] p-5 overflow-hidden gap-0 w-full sm:w-[95vw]"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                    <FormField
                        control={form.control}
                        name="date_worked"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date Worked</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reason / Work Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe the work done..."
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Request
                        </Button>
                    </div>
                </form>
            </Form>
        </SimpleDialog>
    )
}
