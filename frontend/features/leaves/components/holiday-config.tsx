"use client"

import { useState } from "react"
import { usePublicHolidays, useCreateHoliday, useUpdateHoliday, useDeleteHoliday } from "../hooks/use-leaves"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Loader2, Calendar as MapIcon, Globe, MapPin, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SimpleDialog } from "@/components/ui/simple-dialog"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PublicHoliday, HolidayType } from "@/types/leave"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

const holidaySchema = z.object({
    name: z.string().min(1, "Name is required"),
    holiday_date: z.string().min(1, "Date is required"),
    holiday_type: z.nativeEnum(HolidayType),
    is_restricted: z.boolean(),
    description: z.string().optional().nullable(),
    recurring: z.boolean(),
})

export const HolidayConfig = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null)
    const [idToDelete, setIdToDelete] = useState<number | null>(null)

    const { data: holidays, isLoading } = usePublicHolidays()
    const { mutate: create, isPending: isCreating } = useCreateHoliday()
    const { mutate: update, isPending: isUpdating } = useUpdateHoliday()
    const { mutate: remove, isPending: isDeleting } = useDeleteHoliday()

    const form = useForm<z.infer<typeof holidaySchema>>({
        resolver: zodResolver(holidaySchema),
        defaultValues: {
            name: "",
            holiday_date: "",
            holiday_type: HolidayType.national,
            is_restricted: false,
            description: "",
            recurring: false,
        }
    })

    const onEdit = (holiday: PublicHoliday) => {
        setEditingHoliday(holiday)
        form.reset({
            name: holiday.name,
            holiday_date: holiday.holiday_date,
            holiday_type: holiday.holiday_type,
            is_restricted: holiday.is_restricted,
            description: holiday.description || "",
            recurring: holiday.recurring,
        })
        setIsOpen(true)
    }

    const onSubmit = (values: z.infer<typeof holidaySchema>) => {
        const data: Partial<PublicHoliday> = {
            name: values.name,
            holiday_date: values.holiday_date,
            holiday_type: values.holiday_type,
            is_restricted: values.is_restricted,
            description: values.description || undefined,
            recurring: values.recurring,
        }
        if (editingHoliday) {
            update({ id: editingHoliday.id, data }, {
                onSuccess: () => {
                    setIsOpen(false)
                    setEditingHoliday(null)
                    form.reset()
                }
            })
        } else {
            create(data as any, { // PublicHoliday field set is slightly different from create schema but mutationFn handles it
                onSuccess: () => {
                    setIsOpen(false)
                    form.reset()
                }
            })
        }
    }

    const getHolidayTypeBadge = (type: HolidayType) => {
        if (!type) {
            return (
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-zinc-50 text-zinc-700 border-zinc-100">
                    Unknown
                </Badge>
            )
        }
        const styles = {
            [HolidayType.national]: "bg-emerald-50 text-emerald-700 border-emerald-100",
            [HolidayType.festival]: "bg-amber-50 text-amber-700 border-amber-100",
            [HolidayType.state]: "bg-zinc-100 text-zinc-700 border-zinc-200",
            [HolidayType.declared]: "bg-zinc-50 text-zinc-700 border-zinc-100",
        }
        return (
            <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5", styles[type as keyof typeof styles])}>
                {type.replace(/_/g, ' ')}
            </Badge>
        )
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-2xl border border-dashed text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-sm font-medium text-zinc-400 font-serif">Crunching holiday data...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-serif font-bold text-foreground tracking-tight">Governance & Holidays</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.1em] mt-1">
                        Organization-wide calendar management
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingHoliday(null)
                        form.reset({
                            name: "",
                            holiday_date: "",
                            holiday_type: HolidayType.national,
                            is_restricted: false,
                            description: "",
                            recurring: false,
                        })
                        setIsOpen(true)
                    }}
                    className="rounded-full h-11 px-6 font-bold shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-95"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Holiday
                </Button>
            </div>

            <div className="grid gap-6">
                {!holidays || holidays.length === 0 ? (
                    <div className="p-20 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                        <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-medium text-muted-foreground">Prepare your company calendar by adding holidays.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {holidays.sort((a, b) => a.holiday_date.localeCompare(b.holiday_date)).map((holiday) => (
                            <Card key={holiday.id} className="border shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-all duration-500 bg-background flex flex-col">
                                <CardContent className="p-0 flex-1">
                                    <div className="p-5 flex items-center justify-between bg-zinc-50/50 border-b border-zinc-100 transition-colors group-hover:bg-zinc-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-white rounded-xl flex flex-col items-center justify-center border border-zinc-200 shadow-sm transition-all group-hover:scale-110 group-hover:border-primary/20 group-hover:shadow-primary/5">
                                                <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">
                                                    {format(parseISO(holiday.holiday_date), "MMM")}
                                                </span>
                                                <span className="text-lg font-serif font-bold text-foreground leading-none">
                                                    {format(parseISO(holiday.holiday_date), "dd")}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-serif font-bold text-base text-foreground truncate max-w-[150px] tracking-tight">
                                                    {holiday.name}
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                    {format(parseISO(holiday.holiday_date), "EEEE")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(holiday)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setIdToDelete(holiday.id)} className="h-8 w-8 text-muted-foreground hover:text-red-600">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            {getHolidayTypeBadge(holiday.holiday_type)}
                                            {holiday.is_restricted && (
                                                <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-2 bg-amber-50 text-amber-700 border-amber-100">
                                                    Restricted
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="space-y-4 pt-1">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-zinc-100 rounded-lg text-zinc-500">
                                                    <Globe className="h-3 w-3" />
                                                </div>
                                                <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-tight">
                                                    Global (All Locations)
                                                </p>
                                            </div>
                                            {holiday.description && (
                                                <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-zinc-100 pl-3">
                                                    "{holiday.description}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                {holiday.recurring && (
                                    <div className="px-5 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center gap-2 group-hover:bg-primary/5 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Auto-Recurring Annually</span>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <SimpleDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={editingHoliday ? "Edit Holiday" : "Add New Holiday"}
                description="Configure holidays for the organization."
                className="max-w-md border shadow-2xl rounded-xl"
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Holiday Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Holiday Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Diwali" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date */}
                        <FormField
                            control={form.control}
                            name="holiday_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Holiday Type */}
                        <FormField
                            control={form.control}
                            name="holiday_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(HolidayType).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Add notes..." {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Toggles */}
                        <div className="space-y-3 pt-2">
                            <FormField
                                control={form.control}
                                name="is_restricted"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm">Restricted Holiday</FormLabel>
                                            <FormDescription className="text-xs">Employees must apply</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="recurring"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm">Recurring Annually</FormLabel>
                                            <FormDescription className="text-xs">Repeats every year</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating || isUpdating}>
                                {isCreating || isUpdating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    editingHoliday ? "Update" : "Create"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SimpleDialog>

            <ConfirmDialog
                isOpen={!!idToDelete}
                onClose={() => setIdToDelete(null)}
                onConfirm={() => {
                    if (idToDelete) {
                        remove(idToDelete, {
                            onSuccess: () => setIdToDelete(null)
                        })
                    }
                }}
                title="Abolish Holiday Control?"
                description="This will permanently remove this holiday from the system. Past leave applications already processed using this definition will not be retroactively re-calculated."
                isLoading={isDeleting}
            />
        </div>
    )
}
