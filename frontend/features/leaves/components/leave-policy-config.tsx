"use client"

import { useState } from "react"
import { useLeaveTypes, useCreateLeaveType, useUpdateLeaveType, useDeleteLeaveType } from "../hooks/use-leaves"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
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
    FormDescription
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { LeaveType, LeaveTypeEnum } from "@/types/leave"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Switch } from "@/components/ui/switch"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"

const leaveTypeSchema = z.object({
    name: z.nativeEnum(LeaveTypeEnum),
    abbr: z.string().min(1, "Abbreviation is required").max(10),
    annual_entitlement: z.coerce.number().min(0),
    carry_forward: z.boolean().default(false),
    max_carry_forward: z.coerce.number().optional().nullable(),
    encashment: z.boolean().default(false),
    max_encashment_per_year: z.coerce.number().optional().nullable(),
    accrual_method: z.string().min(1),
    negative_balance_allowed: z.boolean().default(false),
    requires_approval: z.boolean().default(true),
    min_days_in_advance: z.coerce.number().optional().nullable(),
    max_consecutive_days: z.coerce.number().optional().nullable(),
})

type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>

export function LeavePolicyConfig() {
    const { data: leaveTypes, isLoading } = useLeaveTypes()
    const { mutate: createType, isPending: isCreating } = useCreateLeaveType()
    const { mutate: updateType, isPending: isUpdating } = useUpdateLeaveType()
    const { mutate: deleteType, isPending: isDeleting } = useDeleteLeaveType()

    const [isDialogOpen, setIsOpen] = useState(false)
    const [editingType, setEditingType] = useState<LeaveType | null>(null)
    const [idToDelete, setIdToDelete] = useState<number | null>(null)

    const form = useForm<LeaveTypeFormValues>({
        resolver: zodResolver(leaveTypeSchema),
        defaultValues: {
            name: LeaveTypeEnum.earned_leave,
            abbr: "",
            annual_entitlement: 0,
            carry_forward: false,
            encashment: false,
            accrual_method: "monthly",
            negative_balance_allowed: false,
            requires_approval: true,
        },
    })

    const onEdit = (type: LeaveType) => {
        setEditingType(type)
        form.reset({
            name: type.name,
            abbr: type.abbr,
            annual_entitlement: type.annual_entitlement,
            carry_forward: type.carry_forward,
            max_carry_forward: type.max_carry_forward,
            encashment: type.encashment,
            max_encashment_per_year: type.max_encashment_per_year,
            accrual_method: type.accrual_method,
            negative_balance_allowed: type.negative_balance_allowed,
            requires_approval: type.requires_approval,
            min_days_in_advance: type.min_days_in_advance,
            max_consecutive_days: type.max_consecutive_days,
        })
        setIsOpen(true)
    }

    const onAdd = () => {
        setEditingType(null)
        form.reset({
            name: LeaveTypeEnum.earned_leave,
            abbr: "",
            annual_entitlement: 0,
            carry_forward: false,
            encashment: false,
            accrual_method: "monthly",
            negative_balance_allowed: false,
            requires_approval: true,
        })
        setIsOpen(true)
    }

    const onSubmit = (data: LeaveTypeFormValues) => {
        if (editingType) {
            updateType({ id: editingType.id, data }, {
                onSuccess: () => setIsOpen(false)
            })
        } else {
            createType(data, {
                onSuccess: () => setIsOpen(false)
            })
        }
    }

    if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-serif font-medium text-foreground">Leave Policies</h3>
                    <p className="text-sm text-muted-foreground">Configure global leave entitlements and rules.</p>
                </div>
                <Button onClick={onAdd} className="rounded-full font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Add Leave Type
                </Button>
            </div>

            <div className="grid gap-6">
                {leaveTypes?.map((type) => (
                    <Card key={type.id} className="border-zinc-200 overflow-hidden group">
                        <div className="flex flex-col md:flex-row">
                            <div className="bg-zinc-50 md:w-48 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-100">
                                <div className="text-2xl font-serif font-bold text-primary mb-1">{type.abbr}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">
                                    {type.name.replace(/_/g, ' ')}
                                </div>
                            </div>
                            <CardContent className="flex-1 p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Entitlement</p>
                                        <p className="text-sm font-medium">{type.annual_entitlement} Days / Year</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Accrual</p>
                                        <p className="text-sm font-medium capitalize">{type.accrual_method}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Carry Forward</p>
                                        <p className="text-sm font-medium">{type.carry_forward ? `Yes (Max ${type.max_carry_forward || '∞'})` : 'No'}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEdit(type)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => setIdToDelete(type.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-zinc-50 flex flex-wrap gap-4">
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-50 text-[10px] font-medium text-zinc-600 border border-zinc-100">
                                        {type.requires_approval ? 'Approval Required' : 'Auto-Approve'}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-50 text-[10px] font-medium text-zinc-600 border border-zinc-100">
                                        {type.negative_balance_allowed ? 'Negative Balance OK' : 'No Negative Balance'}
                                    </div>
                                    {type.min_days_in_advance && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-50 text-[10px] font-medium text-zinc-600 border border-zinc-100">
                                            {type.min_days_in_advance} Days Advance Notice
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                ))}
            </div>

            <ConfirmDialog 
                isOpen={!!idToDelete}
                onClose={() => setIdToDelete(null)}
                onConfirm={() => idToDelete && deleteType(idToDelete, { onSuccess: () => setIdToDelete(null) })}
                isLoading={isDeleting}
                title="Delete Leave Policy"
                description="Are you sure you want to delete this leave type? This may affect existing balances and applications."
            />

            <SimpleDialog
                isOpen={isDialogOpen}
                onClose={() => setIsOpen(false)}
                title={editingType ? "Update Leave Policy" : "New Leave Policy"}
                description="Configure rules and entitlements for this leave category."
                className="max-w-3xl"
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category Name</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(LeaveTypeEnum).map((v) => (
                                                    <SelectItem key={v} value={v}>{v.replace(/_/g, ' ').title()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="abbr"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Abbreviation</FormLabel>
                                        <FormControl><Input placeholder="e.g. EL" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="annual_entitlement"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Annual Days</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y py-6 border-zinc-100">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Rules & Accrual</h4>
                                <FormField
                                    control={form.control}
                                    name="accrual_method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-medium">Accrual Method</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="monthly">Monthly Pro-rata</SelectItem>
                                                    <SelectItem value="annual">Annual upfront</SelectItem>
                                                    <SelectItem value="manual">Manual/Special</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center justify-between gap-2 border rounded-lg p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-xs font-medium">Requires Approval</FormLabel>
                                        <p className="text-[10px] text-muted-foreground">Must be approved by manager/HR.</p>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="requires_approval"
                                        render={({ field }) => (
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        )}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-2 border rounded-lg p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-xs font-medium">Allow Negative Balance</FormLabel>
                                        <p className="text-[10px] text-muted-foreground">Allow employees to take more than available.</p>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="negative_balance_allowed"
                                        render={({ field }) => (
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Carry Forward & Encashment</h4>
                                <div className="space-y-4 p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-xs font-medium">Carry Forward Enabled</FormLabel>
                                        <FormField
                                            control={form.control}
                                            name="carry_forward"
                                            render={({ field }) => (
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            )}
                                        />
                                    </div>
                                    {form.watch("carry_forward") && (
                                        <FormField
                                            control={form.control}
                                            name="max_carry_forward"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Max Days Carry Forward</FormLabel>
                                                    <FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                                <div className="space-y-4 p-4 rounded-lg bg-zinc-50 border border-zinc-100">
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-xs font-medium">Encashment Enabled</FormLabel>
                                        <FormField
                                            control={form.control}
                                            name="encashment"
                                            render={({ field }) => (
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="min_days_in_advance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Min Notice (Days)</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl>
                                        <FormDescription className="text-[9px]">Days in advance request must be filed.</FormDescription>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="max_consecutive_days"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Max Consecutive Days</FormLabel>
                                        <FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl>
                                        <FormDescription className="text-[9px]">Limit for a single application.</FormDescription>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isCreating || isUpdating} className="font-bold px-8 rounded-full">
                                {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingType ? "Update Policy" : "Create Policy"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SimpleDialog>
        </div>
    )
}

// Helper to handle title case
declare global {
    interface String {
        title(): string;
    }
}

if (!String.prototype.title) {
    String.prototype.title = function() {
        return this.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };
}
