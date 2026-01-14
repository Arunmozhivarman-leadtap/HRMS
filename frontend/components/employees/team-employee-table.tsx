"use client";

import { Employee } from "@/types/employee";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { DataTable } from "../shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { getPhotoUrl } from "@/lib/utils";

interface TeamEmployeeTableProps {
  employees: Employee[];
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearch: (value: string) => void;
  isLoading?: boolean;
}

export function TeamEmployeeTable({
  employees,
  totalCount,
  pageSize,
  pageIndex,
  onPageChange,
  onPageSizeChange,
  onSearch,
  isLoading
}: TeamEmployeeTableProps) {
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "profile_photo",
      header: "Photo",
      cell: ({ row }) => (
        <Avatar className="h-10 w-10 border border-border shadow-sm">
          <AvatarImage
            src={getPhotoUrl(row.original.profile_photo)}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
            {row.original.first_name[0]}{row.original.last_name[0]}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "full_name",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
            {row.original.full_name}
          </span>
          <span className="text-xs text-muted-foreground font-mono">{row.original.employee_code || "---"}</span>
        </div>
      ),
    },
    {
      accessorKey: "employment_type",
      header: "Employment",
      cell: ({ row }) => (
        <span className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
          {row.original.employment_type}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] flex items-center font-medium text-muted-foreground">
            <Mail className="mr-2 h-3 w-3 text-primary/60" /> {row.original.email}
          </span>
          {row.original.phone && (
            <span className="text-[10px] flex items-center font-medium text-muted-foreground">
              <Phone className="mr-2 h-3 w-3 text-primary/60" /> {row.original.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "employment_status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.employment_status === "active" ? "default" : "secondary"}
          className={row.original.employment_status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-none capitalize font-bold text-[10px]" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none shadow-none capitalize font-bold text-[10px]"}
        >
          {row.original.employment_status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button variant="ghost" size="sm" asChild className="h-8 px-3 rounded-md hover:bg-primary/10 hover:text-primary transition-all text-[11px] font-medium border border-transparent hover:border-primary/20">
            <Link href={`/dashboard/employees/${row.original.id}`}>
              <Eye className="mr-1.5 h-3.5 w-3.5" /> View Profile
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
      <CardContent className="p-4 flex-1 flex flex-col min-h-0">
        <DataTable
          columns={columns}
          data={employees}
          totalCount={totalCount}
          pageSize={pageSize}
          pageIndex={pageIndex}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onSearch={onSearch}
          searchPlaceholder="Search team members..."
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
