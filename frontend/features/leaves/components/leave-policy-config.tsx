"use client"

import { useState } from "react"
import { useLeaveTypes, useCreateLeaveType, useUpdateLeaveType, useDeleteLeaveType } from "../hooks/use-leaves"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Loader2, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
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
    max_carry_forward: z.union([z.coerce.number(), z.null()]).optional(),
    encashment: z.boolean().default(false),
    max_encashment_per_year: z.union([z.coerce.number(), z.null()]).optional(),
    accrual_method: z.string().min(1),
    negative_balance_allowed: z.boolean().default(false),
    requires_approval: z.boolean().default(true),
    min_days_in_advance: z.union([z.coerce.number(), z.null()]).optional(),
    max_consecutive_days: z.union([z.coerce.number(), z.null()]).optional(),
    approval_levels: z.coerce.number().min(1).default(1),
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
        resolver: zodResolver(leaveTypeSchema) as any,
        defaultValues: {
            name: LeaveTypeEnum.earned_leave,
            abbr: "",
            annual_entitlement: 0,
            carry_forward: false,
            encashment: false,
            accrual_method: "monthly",
            negative_balance_allowed: false,
            requires_approval: true,
            approval_levels: 1,
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
            approval_levels: type.approval_levels || 1,
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
            approval_levels: 1,
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

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading policy data...</p>
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">Governance & Policies</h3>
                    <p className="text-sm text-muted-foreground mt-1">Define entitlements, accrual rules, and approval workflows.</p>
                </div>
                <Button onClick={onAdd} className="rounded-full h-11 px-6 font-bold shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> New Leave Category
                </Button>
            </div>

            <div className="grid gap-6">
                {leaveTypes?.map((type) => (
                    <Card key={type.id} className="border shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col md:flex-row">
                            <div className="bg-zinc-50 md:w-56 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-100 transition-colors group-hover:bg-zinc-100/50">
                                <div className="text-3xl font-serif font-bold text-primary mb-2 tracking-tighter">{type.abbr}</div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center line-clamp-2">
                                    {type.name.replace(/_/g, ' ')}
                                </div>
                            </div>
                            <CardContent className="flex-1 p-6 flex flex-col justify-between">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entitlement</p>
                                        <p className="text-sm font-bold text-foreground">{type.annual_entitlement} Days <span className="text-[10px] text-muted-foreground font-normal">/ year</span></p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Accrual Level</p>
                                        <p className="text-sm font-medium capitalize text-foreground">{type.accrual_method}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Carry Forward</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn("text-sm font-medium", type.carry_forward ? "text-emerald-600" : "text-zinc-400")}>
                                                {type.carry_forward ? "Enabled" : "Disabled"}
                                            </span>
                                            {type.carry_forward && <span className="text-[10px] text-muted-foreground">(Max {type.max_carry_forward || '∞'})</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-start gap-2">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-zinc-100 rounded-lg" onClick={() => onEdit(type)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => setIdToDelete(type.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-6 pt-5 border-t border-zinc-50 flex flex-wrap gap-3">
                                    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-tight py-0.5 px-2 rounded", type.requires_approval ? "border-amber-100 bg-amber-50 text-amber-700" : "border-emerald-100 bg-emerald-50 text-emerald-700")}>
                                        {type.requires_approval ? `${type.approval_levels || 1} Level Approval` : 'Auto-Approve'}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight py-0.5 px-2 rounded border-zinc-200 bg-zinc-50 text-zinc-600">
                                        {type.negative_balance_allowed ? 'Negative Balance OK' : 'No Negative Balance'}
                                    </Badge>
                                    {type.min_days_in_advance && (
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight py-0.5 px-2 rounded border-zinc-200 bg-zinc-50 text-zinc-600">
                                            {type.min_days_in_advance} Days Advance Notice
                                        </Badge>
                                    )}
                                    {type.encashment && (
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight py-0.5 px-2 rounded border-zinc-200 bg-zinc-100 text-zinc-700">
                                            Encashment: Max {type.max_encashment_per_year || '∞'}
                                        </Badge>
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
                title="Decommission Policy"
                description="Are you sure you want to delete this leave type? This action is irreversible and may affect historical records."
            />

            <SimpleDialog
                isOpen={isDialogOpen}
                onClose={() => setIsOpen(false)}
                title={editingType ? "Update Governance" : "New Leave Category"}
                description="Define the legal and operational rules for this entitlement."
                className="lg:max-w-4xl"
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
                        <div className="flex flex-col lg:flex-row gap-0 border rounded-xl overflow-hidden bg-white border-zinc-200">
                            {/* Left Column: Core Settings */}
                            <div className="flex-1 p-6 md:p-8 space-y-8 border-b lg:border-b-0 lg:border-r border-zinc-100">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-5 w-1 bg-primary rounded-full" />
                                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Identity & Entitlement</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control as any}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category Name</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-11 bg-zinc-50 font-medium">
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
                                            control={form.control as any}
                                            name="abbr"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Short Abbreviation</FormLabel>
                                                    <FormControl><Input placeholder="e.g. EL, SL" className="h-11 bg-zinc-50 font-bold" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <FormField
                                            control={form.control as any}
                                            name="annual_entitlement"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Yearly Quota (Days)</FormLabel>
                                                    <FormControl><Input type="number" className="h-11 bg-zinc-50 font-bold text-primary" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name="accrual_method"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accrual Logistics</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger className="h-11 bg-zinc-50 font-medium"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="monthly">Monthly Allocation</SelectItem>
                                                            <SelectItem value="annual">Annual Frontload</SelectItem>
                                                            <SelectItem value="manual">Special Credit</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Separator className="bg-zinc-100" />

                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-5 w-1 bg-amber-500 rounded-full" />
                                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Validation Rules</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control as any}
                                            name="min_days_in_advance"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Min Notice Period</FormLabel>
                                                    <FormControl><Input type="number" className="h-11 bg-zinc-50" {...field} value={field.value || ""} /></FormControl>
                                                    <FormDescription className="text-[9px]">Days in advance request must be submitted.</FormDescription>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name="max_consecutive_days"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Max Block Limit</FormLabel>
                                                    <FormControl><Input type="number" className="h-11 bg-zinc-50" {...field} value={field.value || ""} /></FormControl>
                                                    <FormDescription className="text-[9px]">Max days allowed in a single application.</FormDescription>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Flags & Advanced */}
                            <div className="lg:w-[320px] bg-zinc-50/50 p-6 md:p-8 space-y-8 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Logic Toggles</h4>

                                        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white border border-zinc-100 shadow-sm">
                                            <div className="space-y-0.5">
                                                <p className="text-[11px] font-bold text-foreground">Requires Approval</p>
                                                <p className="text-[9px] text-muted-foreground">Needs manager sign-off.</p>
                                            </div>
                                            <FormField
                                                control={form.control as any}
                                                name="requires_approval"
                                                render={({ field }) => (
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                )}
                                            />
                                        </div>

                                        {form.watch("requires_approval") && (
                                            <FormField
                                                control={form.control as any}
                                                name="approval_levels"
                                                render={({ field }) => (
                                                    <FormItem className="px-1">
                                                        <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase">Confirmation Cascade</FormLabel>
                                                        <FormControl>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {[1, 2, 3].map((lvl) => (
                                                                    <button
                                                                        key={lvl}
                                                                        type="button"
                                                                        onClick={() => field.onChange(lvl)}
                                                                        className={cn(
                                                                            "h-8 flex-1 rounded text-xs font-bold border transition-all",
                                                                            field.value === lvl ? "bg-primary text-primary-foreground border-primary" : "bg-white text-muted-foreground border-zinc-200 hover:border-primary/40"
                                                                        )}
                                                                    >
                                                                        {lvl} Lvl
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white border border-zinc-100 shadow-sm">
                                            <div className="space-y-0.5">
                                                <p className="text-[11px] font-bold text-foreground">Negative Balance</p>
                                                <p className="text-[9px] text-muted-foreground">Allow taking unearned days.</p>
                                            </div>
                                            <FormField
                                                control={form.control as any}
                                                name="negative_balance_allowed"
                                                render={({ field }) => (
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-4 p-4 rounded-xl bg-white border border-zinc-200 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px] font-bold text-foreground">Carry Forward</p>
                                                <FormField
                                                    control={form.control as any}
                                                    name="carry_forward"
                                                    render={({ field }) => (
                                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                    )}
                                                />
                                            </div>
                                            {form.watch("carry_forward") && (
                                                <FormField
                                                    control={form.control as any}
                                                    name="max_carry_forward"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[9px] text-muted-foreground uppercase font-bold">Max Days</FormLabel>
                                                            <FormControl><Input type="number" className="h-8 text-xs font-bold" {...field} value={field.value || ""} /></FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white border border-zinc-100 shadow-sm">
                                            <p className="text-[11px] font-bold text-foreground">Encashment</p>
                                            <FormField
                                                control={form.control as any}
                                                name="encashment"
                                                render={({ field }) => (
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-6">
                                    <Button type="submit" disabled={isCreating || isUpdating} className="w-full h-11 rounded-xl font-bold text-sm shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-95">
                                        {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingType ? "Save Changes" : "Create Policy"}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="w-full h-10 text-xs font-medium text-muted-foreground">
                                        Discard Changes
                                    </Button>
                                </div>
                            </div>
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
    String.prototype.title = function () {
        return this.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };
}
