"use client";

import { useMasterData, useCreateMasterData } from "@/hooks/use-settings";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface MasterDataTableProps {
  type: string;
  title: string;
  description: string;
  fields: { name: string; label: string; placeholder: string; required?: boolean }[];
}

const masterSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  level: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

export function MasterDataTable({ type, title, description, fields }: MasterDataTableProps) {
  const { data, isLoading } = useMasterData(type);
  const createMutation = useCreateMasterData(type);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof masterSchema>>({
    resolver: zodResolver(masterSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: z.infer<typeof masterSchema>) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast({ title: "Created", description: `${title} entry added successfully.` });
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-muted/30 pb-8 pt-8 px-8 border-b border-muted/20 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-3xl font-serif">{title}</CardTitle>
          <CardDescription className="text-base font-medium">{description}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px]">
              <Plus className="mr-2 h-4 w-4" /> Add {title}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-none shadow-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">Add {title}</DialogTitle>
              <DialogDescription>Add a new entry to the {title.toLowerCase()} master list.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                {fields.map(f => (
                  <FormField
                    key={f.name}
                    control={form.control}
                    name={f.name as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">{f.label}</FormLabel>
                        <FormControl><Input placeholder={f.placeholder} className="h-12 border-none shadow-sm bg-zinc-100/50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button type="submit" disabled={createMutation.isPending} className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Entry"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 hover:bg-zinc-50 border-none">
              <TableHead className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] py-6 px-8">Name</TableHead>
              {fields.filter(f => f.name !== "name").map(f => (
                <TableHead key={f.name} className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] py-6">{f.label}</TableHead>
              ))}
              <TableHead className="text-right text-muted-foreground font-bold uppercase tracking-widest text-[10px] py-6 px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={fields.length + 1} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
            ) : data?.length === 0 ? (
              <TableRow><TableCell colSpan={fields.length + 1} className="h-40 text-center text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No entries found.</TableCell></TableRow>
            ) : (
              data?.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-zinc-50 transition-colors border-zinc-100 group">
                  <TableCell className="py-6 px-8 font-medium font-serif text-lg">{item.name}</TableCell>
                  {fields.filter(f => f.name !== "name").map(f => (
                    <TableCell key={f.name} className="py-6 text-muted-foreground font-medium">{item[f.name] || "---"}</TableCell>
                  ))}
                  <TableCell className="text-right py-6 px-8">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
