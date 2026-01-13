"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Employee } from "@/types/employee";
import { useUpdateEmployee } from "@/hooks/use-employee";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Lock } from "lucide-react";

const statutorySchema = z.object({
    pan_number: z.string().length(10, "PAN must be 10 characters").optional().or(z.literal("")),
    aadhaar_number: z.string().length(12, "Aadhaar must be 12 digits").optional().or(z.literal("")),
    uan_number: z.string().optional(),
    esic_number: z.string().optional(),
});

interface StatutoryEditFormProps {
    employee: Employee;
    onSuccess?: () => void;
}

export function StatutoryEditForm({ employee, onSuccess }: StatutoryEditFormProps) {
    const { toast } = useToast();
    const { user: currentUser } = useUser();
    const updateMutation = useUpdateEmployee();

    const isAdmin = currentUser?.role === "super_admin" || currentUser?.role === "hr_admin";

    const form = useForm<z.infer<typeof statutorySchema>>({
        resolver: zodResolver(statutorySchema),
        defaultValues: {
            pan_number: employee.pan_number || "",
            aadhaar_number: employee.aadhaar_number || "",
            uan_number: employee.uan_number || "",
            esic_number: employee.esic_number || "",
        },
    });

    function onSubmit(values: z.infer<typeof statutorySchema>) {
        // Only admins can update UAN/ESIC
        const payload = isAdmin
            ? values
            : { pan_number: values.pan_number, aadhaar_number: values.aadhaar_number };

        updateMutation.mutate(
            { id: employee.id, data: payload },
            {
                onSuccess: () => {
                    toast({
                        title: "Statutory details updated",
                        description: "Government ID information has been successfully updated.",
                    });
                    onSuccess?.();
                },
                onError: (error: any) => {
                    toast({
                        title: "Update failed",
                        description: error.message || "Failed to update statutory details.",
                        variant: "destructive",
                    });
                },
            }
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <FormField control={form.control} name="pan_number" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">PAN Number</FormLabel><FormControl><Input {...field} className="h-10 bg-muted/20 uppercase" placeholder="ABCDE1234F" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="aadhaar_number" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Aadhaar Number</FormLabel><FormControl><Input {...field} className="h-10 bg-muted/20" placeholder="1234 5678 9012" /></FormControl><FormMessage /></FormItem>
                    )} />

                    <div className="relative">
                        <FormField control={form.control} name="uan_number" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center justify-between">
                                    UAN (PF Number)
                                    {!isAdmin && <Lock className="h-3 w-3 text-amber-500" />}
                                </FormLabel>
                                <FormControl><Input {...field} disabled={!isAdmin} className="h-10 bg-muted/20 disabled:opacity-70" placeholder="100XXXXXXXXX" /></FormControl>
                                {!isAdmin && <p className="text-[10px] text-amber-600 font-medium mt-1 italic">Contact HR to update restricted fields.</p>}
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="relative">
                        <FormField control={form.control} name="esic_number" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center justify-between">
                                    ESIC Number
                                    {!isAdmin && <Lock className="h-3 w-3 text-amber-500" />}
                                </FormLabel>
                                <FormControl><Input {...field} disabled={!isAdmin} className="h-10 bg-muted/20 disabled:opacity-70" placeholder="100XXXXXXXXX" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-border/40">
                    <Button type="submit" disabled={updateMutation.isPending} className="h-11 px-10 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Statutory Details
                    </Button>
                </div>
            </form>
        </Form>
    );
}
