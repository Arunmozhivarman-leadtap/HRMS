"use client"

import { useState } from "react"
import { usePublicHolidays, useCreateHoliday, useUpdateHoliday, useDeleteHoliday } from "@/features/leaves/hooks/use-leaves"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Loader2, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { SimpleDialog } from "@/components/ui/simple-dialog"
import { Input } from "@/components/ui/input"
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Switch } from "@/components/ui/switch"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { PublicHoliday, HolidayType } from "@/types/leave"
import { format, parseISO } from "date-fns"

const holidaySchema = z.object({
    name: z.string().min(1, "Name is required"),
    holiday_date: z.string().min(1, "Date is required"),
    holiday_type: z.nativeEnum(HolidayType),
    is_restricted: z.boolean().default(false),
    recurring: z.boolean().default(false),
    description: z.string().optional(),
})

type HolidayFormValues = z.infer<typeof holidaySchema>

export function HolidayConfig() {
    const { data: holidays, isLoading } = usePublicHolidays()
    const { mutate: createHoliday, isPending: isCreating } = useCreateHoliday()
    const { mutate: updateHoliday, isPending: isUpdating } = useUpdateHoliday()
    const { mutate: deleteHoliday, isPending: isDeleting } = useDeleteHoliday()

    const [isDialogOpen, setIsOpen] = useState(false)
    const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null)
    const [idToDelete, setIdToDelete] = useState<number | null>(null)

    const form = useForm<HolidayFormValues>({
        resolver: zodResolver(holidaySchema) as any,
        defaultValues: {
            name: "",
            holiday_date: "",
            holiday_type: HolidayType.national,
            is_restricted: false,
            recurring: false,
            description: "",
        },
    })

    const onEdit = (holiday: PublicHoliday) => {
        setEditingHoliday(holiday)
        form.reset({
            name: holiday.name,
            holiday_date: holiday.holiday_date,
            holiday_type: holiday.holiday_type,
            is_restricted: holiday.is_restricted,
            recurring: holiday.recurring,
            description: holiday.description || "",
        })
        setIsOpen(true)
    }

    const onAdd = () => {
        setEditingHoliday(null)
        form.reset({
            name: "",
            holiday_date: "",
            holiday_type: HolidayType.national,
            is_restricted: false,
            recurring: false,
            description: "",
        })
        setIsOpen(true)
    }

    const onSubmit = (data: HolidayFormValues) => {
        if (editingHoliday) {
            updateHoliday({ id: editingHoliday.id, data }, {
                onSuccess: () => setIsOpen(false)
            })
        } else {
            createHoliday(data, {
                onSuccess: () => setIsOpen(false)
            })
        }
    }

    if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-serif font-medium text-foreground">Holiday Calendar</h3>
                    <p className="text-sm text-muted-foreground">Manage public and restricted holidays.</p>
                </div>
                <Button onClick={onAdd} className="rounded-full font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Add Holiday
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {holidays?.map((holiday) => (
                    <Card key={holiday.id} className="group border-zinc-200 hover:border-zinc-300 transition-all">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-12 h-12 bg-zinc-50 rounded-lg flex flex-col items-center justify-center border border-zinc-100">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                            {format(parseISO(holiday.holiday_date), 'MMM')}
                                        </span>
                                        <span className="text-lg font-serif font-bold text-foreground">
                                            {format(parseISO(holiday.holiday_date), 'd')}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm">{holiday.name}</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 capitalize">
                                                {holiday.holiday_type}
                                            </span>
                                            {holiday.is_restricted && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                                                    Restricted
                                                </span>
                                            )}
                                            {holiday.recurring && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                                    Recurring
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(holiday)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setIdToDelete(holiday.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ConfirmDialog 
                isOpen={!!idToDelete}
                onClose={() => setIdToDelete(null)}
                onConfirm={() => idToDelete && deleteHoliday(idToDelete, { onSuccess: () => setIdToDelete(null) })}
                isLoading={isDeleting}
                title="Delete Holiday"
                description="Are you sure you want to delete this holiday?"
            />

            <SimpleDialog
                isOpen={isDialogOpen}
                onClose={() => setIsOpen(false)}
                title={editingHoliday ? "Edit Holiday" : "New Holiday"}
                description="Configure holiday details."
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control as any}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium">Holiday Name</FormLabel>
                                    <FormControl><Input placeholder="e.g. Diwali" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="holiday_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-medium">Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="holiday_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-medium">Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(HolidayType).map((t) => (
                                                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control as any}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium">Description (Optional)</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4 pt-2">
                            <FormField
                                control={form.control as any}
                                name="is_restricted"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 space-y-0 flex-1">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-xs font-medium">Restricted Holiday</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="recurring"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 space-y-0 flex-1">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-xs font-medium">Recurring</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isCreating || isUpdating}>
                                {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingHoliday ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SimpleDialog>
        </div>
    )
}
