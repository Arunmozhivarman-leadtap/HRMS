"use client";

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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateCompanySettings } from "@/hooks/use-settings";

const companyFormSchema = z.object({
  company_name: z.string().min(2, "Required"),
  trading_name: z.string().optional(),
  registration_number: z.string().optional(),
  gst_number: z.string().optional(),
  pan_number: z.string().optional(),
  pf_registration: z.string().optional(),
  esi_registration: z.string().optional(),
  registered_address: z.string().optional(),
});

export function CompanyForm({ initialData }: { initialData: any }) {
  const { toast } = useToast();
  const updateMutation = useUpdateCompanySettings();

  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      company_name: initialData?.company_name || "",
      trading_name: initialData?.trading_name || "",
      registration_number: initialData?.registration_number || "",
      gst_number: initialData?.gst_number || "",
      pan_number: initialData?.pan_number || "",
      pf_registration: initialData?.pf_registration || "",
      esi_registration: initialData?.esi_registration || "",
      registered_address: initialData?.registered_address || "",
    },
  });

  function onSubmit(values: z.infer<typeof companyFormSchema>) {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast({ title: "Settings updated", description: "Company profile has been saved." });
      },
      onError: (error: any) => {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-medium">Identity</h3>
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">Legal Entity Name</FormLabel>
                  <FormControl><Input className="h-11 bg-background border-border/60 focus:ring-primary/20 transition-all text-sm" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trading_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">Trading Name (Brand)</FormLabel>
                  <FormControl><Input className="h-11 bg-background border-border/60 focus:ring-primary/20 transition-all text-sm" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">Registration Number (CIN/LLP)</FormLabel>
                  <FormControl><Input className="h-11 bg-background border-border/60 focus:ring-primary/20 transition-all text-sm font-mono uppercase" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-serif font-medium">Statutory</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gst_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">GSTIN</FormLabel>
                    <FormControl><Input className="h-11 bg-background border-border/60 focus:ring-primary/20 transition-all text-sm font-mono uppercase" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pan_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">Company PAN</FormLabel>
                    <FormControl><Input className="h-11 bg-background border-border/60 focus:ring-primary/20 transition-all text-sm font-mono uppercase" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="pf_registration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">PF Registration (EPFO)</FormLabel>
                  <FormControl><Input className="h-11 bg-background border-border/60 focus:ring-primary/20 transition-all text-sm font-mono" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="esi_registration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">ESI Registration (ESIC)</FormLabel>
                  <FormControl><Input className="h-11 bg-background border-border/60 focus:ring-primary/20 transition-all text-sm font-mono" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6 max-w-2xl">
          <h3 className="text-xl font-serif font-medium">Address</h3>
          <FormField
            control={form.control}
            name="registered_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">Registered Office Address</FormLabel>
                <FormControl><Textarea rows={4} className="bg-background border border-border/60 focus:ring-primary/20 transition-all rounded-xl p-4 text-sm" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-start">
          <Button type="submit" disabled={updateMutation.isPending} className="h-12 px-10 rounded-xl shadow-md active:scale-95 transition-all font-bold uppercase tracking-widest text-[10px]">
            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Organizational Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}
