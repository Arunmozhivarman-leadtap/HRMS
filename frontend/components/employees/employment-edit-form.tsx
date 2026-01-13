"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Employee } from "@/types/employee";
import { useUpdateEmployee } from "@/hooks/use-employee";
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
import { Loader2, Save } from "lucide-react";
import { useDepartments, useDesignations } from "@/hooks/use-master-data";
import { useEmployees } from "@/hooks/use-employee";
import { formatErrorMessage } from "@/lib/utils";

const employmentSchema = z.object({
    employee_code: z.string().optional(),
    date_of_joining: z.string().optional(),
    employment_type: z.string().optional(),
    department_id: z.string().optional(),
    designation_id: z.string().optional(),
    manager_id: z.string().optional(),
});

interface EmploymentEditFormProps {
    employee: Employee;
    onSuccess?: () => void;
    isAdmin?: boolean;
}

export function EmploymentEditForm({ employee, onSuccess, isAdmin = false }: EmploymentEditFormProps) {
    const { toast } = useToast();
    const updateMutation = useUpdateEmployee();
    const { data: departments } = useDepartments();
    const { data: designations } = useDesignations();
    const { data: employees } = useEmployees({ limit: 1000 });

    const form = useForm<z.infer<typeof employmentSchema>>({
        resolver: zodResolver(employmentSchema),
        defaultValues: {
            employee_code: employee.employee_code || "",
            date_of_joining: employee.date_of_joining || "",
            employment_type: employee.employment_type || "",
            department_id: employee.department_id?.toString() || "",
            designation_id: employee.designation_id?.toString() || "",
            manager_id: employee.manager_id?.toString() || "",
        },
    });

    function onSubmit(values: z.infer<typeof employmentSchema>) {
        // Parse IDs to numbers
        const payload = {
            ...values,
            department_id: values.department_id ? parseInt(values.department_id) : null,
            designation_id: values.designation_id ? parseInt(values.designation_id) : null,
            manager_id: values.manager_id ? parseInt(values.manager_id) : null,
        };

        updateMutation.mutate(
            { id: employee.id, data: payload as any },
            {
                onSuccess: () => {
                    toast({
                        title: "Employment updated",
                        description: "Organizational information has been successfully updated.",
                    });
                    onSuccess?.();
                },
                onError: (error: any) => {
                    toast({
                        title: "Update failed",
                        description: formatErrorMessage(error),
                        variant: "destructive",
                    });
                },
            }
        );
    }

    const managerOptions = employees?.items.filter(e =>
        ["super_admin", "hr_admin", "manager"].includes(e.role) && e.id !== employee.id
    ) || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2">Job Details</h3>

                        <FormField control={form.control} name="employee_code" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Employee Code</FormLabel><FormControl><Input {...field} disabled={!isAdmin} className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="designation_id" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Designation</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}><FormControl><SelectTrigger className="h-10 bg-muted/20"><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{designations?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="department_id" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Department</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}><FormControl><SelectTrigger className="h-10 bg-muted/20"><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{departments?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2">Hierarchy & Status</h3>

                        <FormField control={form.control} name="date_of_joining" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Date of Joining</FormLabel><FormControl><Input {...field} type="date" disabled={!isAdmin} className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="employment_type" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Employment Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}><FormControl><SelectTrigger className="h-10 bg-muted/20"><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="full-time">Full-time</SelectItem><SelectItem value="part-time">Part-time</SelectItem><SelectItem value="contract">Contract</SelectItem><SelectItem value="intern">Intern</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )} />

                        <FormField control={form.control} name="manager_id" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Reporting Manager</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}><FormControl><SelectTrigger className="h-10 bg-muted/20"><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{managerOptions.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.full_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex justify-end pt-6 border-t border-border/40">
                        <Button type="submit" disabled={updateMutation.isPending} className="h-11 px-10 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Update Employment Details
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
}
