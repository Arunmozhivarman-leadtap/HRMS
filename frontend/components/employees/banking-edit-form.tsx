"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Employee } from "@/types/employee";
import { useUpdateBankingInfo } from "@/hooks/use-employee";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Landmark } from "lucide-react";

const bankingSchema = z.object({
    bank_account_holder_name: z.string().min(2, "Name is required"),
    bank_name: z.string().min(1, "Bank name is required"),
    branch_name: z.string().min(1, "Branch name is required"),
    account_number: z.string().min(9, "Valid account number required").max(18),
    confirm_account_number: z.string(),
    ifsc_code: z.string().length(11, "IFSC code must be 11 characters"),
    account_type: z.enum(["Savings", "Current"]),
}).refine((data) => data.account_number === data.confirm_account_number, {
    message: "Account numbers do not match",
    path: ["confirm_account_number"],
});

interface BankingEditFormProps {
    employee: Employee;
    onSuccess?: () => void;
}

export function BankingEditForm({ employee, onSuccess }: BankingEditFormProps) {
    const { toast } = useToast();
    const updateMutation = useUpdateBankingInfo();

    const form = useForm<z.infer<typeof bankingSchema>>({
        resolver: zodResolver(bankingSchema),
        defaultValues: {
            bank_account_holder_name: employee.bank_account_holder_name || employee.full_name,
            bank_name: employee.bank_name || "",
            branch_name: employee.branch_name || "",
            account_number: employee.account_number || "",
            confirm_account_number: employee.account_number || "",
            ifsc_code: employee.ifsc_code || "",
            account_type: (employee.account_type as "Savings" | "Current") || "Savings",
        },
    });

    function onSubmit(values: z.infer<typeof bankingSchema>) {
        updateMutation.mutate(values, {
            onSuccess: () => {
                toast({
                    title: "Banking details updated",
                    description: "Your salary account information has been saved.",
                });
                onSuccess?.();
            },
            onError: (error: any) => {
                toast({
                    title: "Update failed",
                    description: error.message || "Failed to update banking info.",
                    variant: "destructive",
                });
            },
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <FormField control={form.control} name="bank_account_holder_name" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Account Holder Name</FormLabel><FormControl><Input {...field} className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="bank_name" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Bank Name</FormLabel><FormControl><Input {...field} placeholder="e.g. HDFC Bank" className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="branch_name" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Branch Name</FormLabel><FormControl><Input {...field} className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="account_type" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Account Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10 bg-muted/20"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Savings">Savings Account</SelectItem><SelectItem value="Current">Current Account</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="account_number" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Account Number</FormLabel><FormControl><Input {...field} type="password" placeholder="••••••••••••" className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="confirm_account_number" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Confirm Account Number</FormLabel><FormControl><Input {...field} placeholder="Re-enter account number" className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="ifsc_code" render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">IFSC Code</FormLabel><FormControl><Input {...field} placeholder="HDFC0001234" className="uppercase h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-lg">
                        <Landmark className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-900">Important Note</p>
                        <p className="text-xs text-amber-700 mt-0.5 font-medium leading-relaxed">Ensure your bank details match your passbook or cheque book. Incorrect details may lead to delayed salary transfers.</p>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-border/40">
                    <Button type="submit" disabled={updateMutation.isPending} className="h-11 px-10 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Banking Information
                    </Button>
                </div>
            </form>
        </Form>
    );
}
