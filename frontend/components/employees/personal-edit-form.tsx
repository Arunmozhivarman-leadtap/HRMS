"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Employee } from "@/types/employee";
import { useUpdateEmployee } from "@/hooks/use-employee";
import { getPhotoUrl, formatErrorMessage } from "@/lib/utils";
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

const personalFormSchema = z.object({
  first_name: z.string().min(2, "Required"),
  last_name: z.string().min(1, "Required"),
  phone: z.string().optional(),
  personal_email: z.string().email("Invalid email").optional().or(z.literal("")),
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  marital_status: z.string().optional(),
  date_of_birth: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

interface PersonalEditFormProps {
  employee: Employee;
  onSuccess?: () => void;
}

export function PersonalEditForm({ employee, onSuccess }: PersonalEditFormProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateEmployee();

  const form = useForm<z.infer<typeof personalFormSchema>>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: {
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      phone: employee.phone || "",
      personal_email: employee.personal_email || "",
      gender: employee.gender || "",
      blood_group: employee.blood_group || "",
      marital_status: employee.marital_status || "",
      date_of_birth: employee.date_of_birth || "",
      emergency_contact_name: employee.emergency_contact_name || "",
      emergency_contact_relation: employee.emergency_contact_relation || "",
      emergency_contact_phone: employee.emergency_contact_phone || "",
    },
  });

  function onSubmit(values: z.infer<typeof personalFormSchema>) {
    updateMutation.mutate(
      { id: employee.id, data: values },
      {
        onSuccess: () => {
          toast({
            title: "Profile updated",
            description: "Personal information has been successfully updated.",
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2">Identity & Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">First Name</FormLabel><FormControl><Input {...field} className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Last Name</FormLabel><FormControl><Input {...field} className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="personal_email" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Personal Email</FormLabel><FormControl><Input {...field} type="email" placeholder="john.doe@gmail.com" className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Phone Number</FormLabel><FormControl><Input {...field} placeholder="+91 98765 43210" className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="date_of_birth" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Date of Birth</FormLabel><FormControl><Input {...field} type="date" className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2">Medical & Marital</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10 bg-muted/20"><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="marital_status" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Marital Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10 bg-muted/20"><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="blood_group" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Blood Group</FormLabel><FormControl><Input {...field} placeholder="e.g. O+" className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="emergency_contact_name" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Contact Person Name</FormLabel><FormControl><Input {...field} className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="emergency_contact_relation" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Relation</FormLabel><FormControl><Input {...field} className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="emergency_contact_phone" render={({ field }) => (
              <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Emergency Phone</FormLabel><FormControl><Input {...field} className="h-10 bg-muted/20" /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border/40">
          <Button type="submit" disabled={updateMutation.isPending} className="h-11 px-10 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Update Personal Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
