"use client";

import { Employee } from "@/types/employee";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Archive,
  FileText,
  MoreVertical,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useArchiveEmployee, useRestoreEmployee } from "@/hooks/use-employee";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { format } from "date-fns";
import { getPhotoUrl } from "@/lib/utils";
import { DataTable } from "../shared/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface AdminEmployeeTableProps {
  employees: Employee[];
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearch: (value: string) => void;
  isArchivedView?: boolean;
}

export function AdminEmployeeTable({
  employees,
  totalCount,
  pageSize,
  pageIndex,
  onPageChange,
  onPageSizeChange,
  onSearch,
  isArchivedView = false
}: AdminEmployeeTableProps) {
  const { toast } = useToast();
  const archiveMutation = useArchiveEmployee();
  const restoreMutation = useRestoreEmployee();

  const handleArchive = (id: number, name: string) => {
    if (confirm(`Are you sure you want to archive ${name}? This will disable their account.`)) {
      archiveMutation.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Employee Archived",
            description: `${name} has been moved to archives.`,
          });
        }
      });
    }
  };

  const handleRestore = (id: number, name: string) => {
    if (confirm(`Restore ${name} to active status?`)) {
      restoreMutation.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Employee Restored",
            description: `${name} is now active again.`,
          });
        }
      });
    }
  };

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "profile_photo",
      header: "Photo",
      cell: ({ row }) => (
        <Avatar className="h-10 w-10 border border-border shadow-sm rounded-lg overflow-hidden">
          <AvatarImage
            src={getPhotoUrl(row.original.profile_photo)}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {row.original.first_name[0]}{row.original.last_name[0]}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "full_name",
      header: "Employee Details",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
            {row.original.full_name}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "organization",
      header: "Organization",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-mono font-medium text-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/40 w-fit">
            {row.original.employee_code || "---"}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">
            {row.original.employment_type}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize font-bold text-[10px] px-2.5 py-0.5 border-border bg-white shadow-none text-muted-foreground">
          {row.original.role.replace("_", " ")}
        </Badge>
      ),
    },
    {
      accessorKey: isArchivedView ? "archived_at" : "employment_status",
      header: isArchivedView ? "Archived Date" : "Status",
      cell: ({ row }) => {
        const emp = row.original;
        return isArchivedView ? (
          <div className="text-xs font-medium text-amber-700">
            {emp.archived_at ? format(new Date(emp.archived_at), "PPP") : "N/A"}
          </div>
        ) : (
          <Badge
            variant={emp.employment_status === "active" ? "default" : "secondary"}
            className={emp.employment_status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-none capitalize font-bold text-[10px]" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none shadow-none capitalize font-bold text-[10px]"}
          >
            {emp.employment_status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl shadow-xl border-border/60">
                <DropdownMenuLabel className="text-xs font-bold text-muted-foreground px-3 py-2">Employee Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/employees/${emp.id}`} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-primary/5 group/item">
                    <Eye className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                    <span className="text-sm font-medium">View Full Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/employees/${emp.id}?tab=documents`} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-primary/5 group/item">
                    <FileText className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                    <span className="text-sm font-medium">Manage Documents</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isArchivedView ? (
                  <DropdownMenuItem
                    onClick={() => handleRestore(emp.id, emp.full_name)}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-emerald-600 hover:bg-emerald-50 focus:bg-emerald-50 focus:text-emerald-700 active:bg-emerald-100 group/item"
                  >
                    <RotateCcw className="h-4 w-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Restore Employee</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleArchive(emp.id, emp.full_name)}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-amber-600 hover:bg-amber-50 focus:bg-amber-50 focus:text-amber-700 active:bg-amber-100 group/item"
                  >
                    <Archive className="h-4 w-4 group-hover/item:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Archive Profile</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={employees}
      totalCount={totalCount}
      pageSize={pageSize}
      pageIndex={pageIndex}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onSearch={onSearch}
      searchPlaceholder="Search employees..."
      showSearch={false}
      isLoading={archiveMutation.isPending || restoreMutation.isPending}
    />
  );
}
