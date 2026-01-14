"use client";

import { useMasterData, useCreateMasterData } from "@/hooks/use-settings";
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
import { DataTable } from "../shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { usePagination } from "@/hooks/use-pagination";

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
  const {
    pageIndex,
    pageSize,
    search,
    skip,
    limit,
    onPageChange,
    onPageSizeChange,
    onSearch
  } = usePagination(10);

  const { data, isLoading } = useMasterData(type, { skip, limit, search });
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium text-sm text-foreground">{row.original.name}</span>
      ),
    },
    ...fields.filter(f => f.name !== "name").map(f => ({
      accessorKey: f.name,
      header: f.label,
      cell: ({ row }: { row: any }) => (
        <span className="text-xs font-medium text-muted-foreground">{row.original[f.name] || "---"}</span>
      ),
    })),
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: () => (
        <div className="text-right">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors rounded-full">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="border shadow-sm rounded-xl overflow-hidden bg-white">
      <CardHeader className="bg-muted/30 pb-6 pt-6 px-6 border-b border-muted/20 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-serif">{title}</CardTitle>
          <CardDescription className="text-sm font-medium">{description}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 px-6 shadow-md active:scale-95 transition-all font-bold uppercase tracking-widest text-[10px]">
              <Plus className="mr-2 h-4 w-4" /> Add {title}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border shadow-2xl rounded-xl">
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
                        <FormControl><Input placeholder={f.placeholder} className="h-11 bg-background border-border/60 focus:ring-primary/20 transition-all text-sm" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Entry"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <DataTable
          columns={columns}
          data={data?.items || []}
          totalCount={data?.total || 0}
          pageSize={pageSize}
          pageIndex={pageIndex}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSearch={onSearch}
          searchPlaceholder={`Search ${title.toLowerCase()}...`}
          isLoading={isLoading}
          hasBorder={false}
        />
      </CardContent>
    </Card>
  );
}
