"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff, Copy } from "lucide-react";
import { fetcher } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useDepartments, useDesignations } from "@/hooks/use-master-data";
import { useEmployees } from "@/hooks/use-employee";
import { useUser } from "@/hooks/use-user";
import { formatErrorMessage } from "@/lib/utils";

const formSchema = z.object({
  // Basic Info
  first_name: z.string().min(2, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 chars"),
  employee_code: z.string().optional(),
  phone: z.string().optional(),
  personal_email: z.string().email("Invalid email").optional().or(z.literal("")),

  // Employment
  date_of_joining: z.string().min(1, "Required"),
  employment_type: z.string().min(1, "Required"),
  role: z.string().min(1, "Required"),
  department_id: z.string().optional(),
  designation_id: z.string().optional(),
  manager_id: z.string().optional(),

  // Personal
  gender: z.string().optional(),
  blood_group: z.string().optional(),
  marital_status: z.string().optional(),

  // Statutory
  pan_number: z.string().optional(),
  aadhaar_number: z.string().optional(),
  uan_number: z.string().optional(),
  esic_number: z.string().optional(),
})
  .refine((data) => {
    if (data.pan_number && data.pan_number.length > 0 && data.pan_number.length !== 10) return false;
    return true;
  }, { message: "PAN must be 10 chars", path: ["pan_number"] })
  .refine((data) => {
    if (data.aadhaar_number && data.aadhaar_number.length > 0 && data.aadhaar_number.length !== 12) return false;
    return true;
  }, { message: "Aadhaar must be 12 digits", path: ["aadhaar_number"] });

export function EmployeeCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useUser();

  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const { data: employees } = useEmployees({ limit: 1000 });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "Welcome@HRMS123",
      employee_code: "",
      phone: "",
      personal_email: "",
      date_of_joining: new Date().toISOString().split('T')[0],
      employment_type: "full-time",
      role: "employee",
      department_id: "",
      designation_id: "",
      manager_id: "",
      gender: "",
      blood_group: "",
      marital_status: "",
      pan_number: "",
      aadhaar_number: "",
      uan_number: "",
      esic_number: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (step < 4) return; // Prevent submission unless on final step
    setIsSubmitting(true);
    try {
      // Convert string IDs back to numbers for backend
      const { personal_email, ...otherValues } = values;
      const payload = {
        ...otherValues,
        personal_email: personal_email || null,
        department_id: values.department_id ? parseInt(values.department_id) : null,
        designation_id: values.designation_id ? parseInt(values.designation_id) : null,
        manager_id: values.manager_id ? parseInt(values.manager_id) : null,
      };

      await fetcher("/employees/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast({
        title: "Employee Created",
        description: `${values.first_name} has been successfully added.`,
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Creation failed",
        description: formatErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const roleOptions = [
    { value: "employee", label: "Employee" },
    { value: "manager", label: "Manager" },
    ...(currentUser?.role === "super_admin" ? [{ value: "hr_admin", label: "HR Admin" }] : []),
  ];

  const nextStep = () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["first_name", "last_name", "email", "password", "phone"];
    if (step === 2) fieldsToValidate = ["date_of_joining", "employment_type", "role", "department_id", "designation_id"];

    form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) setStep(step + 1);
    });
  };

  const prevStep = () => setStep(step - 1);

  const copyPassword = () => {
    const pwd = form.getValues("password");
    if (pwd) {
      navigator.clipboard.writeText(pwd);
      toast({
        title: "Copied",
        description: "Password copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`
              h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500
              ${step >= s ? "bg-primary text-primary-foreground shadow-lg scale-110" : "bg-muted text-muted-foreground"}
            `}>
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 4 && (
              <div className={`h-[1px] flex-1 mx-2 transition-colors duration-500 ${step > s ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && step < 4) {
              e.preventDefault();
              nextStep();
            }
          }}
          className="space-y-6"
        >
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-serif font-medium text-foreground">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="first_name" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</FormLabel><FormControl><Input placeholder="John" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="last_name" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Work Email</FormLabel><FormControl><Input placeholder="john.doe@company.com" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</FormLabel><FormControl><Input placeholder="+91 9876543210" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="personal_email" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Personal Email</FormLabel><FormControl><Input placeholder="john.personal@gmail.com" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Initial Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                        className="h-10 pr-20"
                      />
                    </FormControl>
                    <div className="absolute right-0 top-0 h-full flex items-center pr-2 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={copyPassword}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-serif font-medium text-foreground">Employment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="employee_code" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Employee Code</FormLabel><FormControl><Input placeholder="EMP001" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="date_of_joining" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Joining Date</FormLabel><FormControl><Input type="date" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="employment_type" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Employment Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="full-time">Full-time</SelectItem><SelectItem value="part-time">Part-time</SelectItem><SelectItem value="contract">Contract</SelectItem><SelectItem value="intern">Intern</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select role" /></SelectTrigger></FormControl><SelectContent>{roleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="department_id" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Department</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select department" /></SelectTrigger></FormControl><SelectContent>{departments?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="designation_id" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Designation</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select designation" /></SelectTrigger></FormControl><SelectContent>{designations?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField control={form.control} name="manager_id" render={({ field }) => {
                  const managerOptions = employees?.items.filter(e => {
                    const role = e.role?.toString().toLowerCase() || "";
                    return role.includes("admin") || role.includes("manager");
                  }) || [];

                  return (
                    <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reporting Manager</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select manager" /></SelectTrigger></FormControl><SelectContent>{managerOptions.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.full_name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  );
                }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-serif font-medium text-foreground">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="blood_group" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Blood Group</FormLabel><FormControl><Input placeholder="O+" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="marital_status" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Marital Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-serif font-medium text-foreground">Statutory Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="pan_number" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PAN Number</FormLabel><FormControl><Input placeholder="ABCDE1234F" className="uppercase h-10" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="aadhaar_number" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Aadhaar Number</FormLabel><FormControl><Input placeholder="1234 5678 9012" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="uan_number" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">UAN (PF Number)</FormLabel><FormControl><Input placeholder="100XXXXXXXXX" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="esic_number" render={({ field }) => (
                  <FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ESIC Number</FormLabel><FormControl><Input placeholder="1234567890" {...field} className="h-10" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="p-4 bg-muted/30 rounded-lg text-[11px] text-muted-foreground border border-border/40 font-medium">
                <p><strong>Note:</strong> Banking details can be added after creation by visiting the employee's profile.</p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-border/40">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep} className="h-10 px-8 font-bold border-border/60">
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            ) : <div />}

            {step < 4 ? (
              <Button type="button" onClick={nextStep} className="h-10 px-8 font-bold shadow-md active:scale-95 transition-all">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="h-10 px-10 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Create Employee
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
