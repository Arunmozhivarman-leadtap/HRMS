"use client";

import { Employee } from "@/types/employee";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Archive,
  FileText,
  MoreVertical,
  RotateCcw,
  Users
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
import { Card } from "../ui/card";
import { format } from "date-fns";
import { getPhotoUrl } from "@/lib/utils";

interface AdminEmployeeTableProps {
  employees: Employee[];
  isArchivedView?: boolean;
}

export function AdminEmployeeTable({ employees, isArchivedView = false }: AdminEmployeeTableProps) {
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

  return (
    <Card className="bg-background border shadow-sm flex flex-col min-h-[400px] overflow-hidden rounded-xl">
      <div className="overflow-auto max-h-[600px] flex-1">
        <Table>
          <TableHeader className="bg-muted/90 backdrop-blur-sm text-muted-foreground [&_th]:font-medium [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider sticky top-0 z-10 shadow-sm border-b">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="w-[80px] py-4 px-6 align-middle">Photo</TableHead>
              <TableHead className="py-4 px-6 align-middle">Employee Details</TableHead>
              <TableHead className="py-4 px-6 align-middle">Organization</TableHead>
              <TableHead className="py-4 px-6 align-middle">Role</TableHead>
              <TableHead className="py-4 px-6 align-middle">{isArchivedView ? "Archived Date" : "Status"}</TableHead>
              <TableHead className="text-right py-4 px-6 align-middle">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-60 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-muted/50">
                      <Users className="h-8 w-8 opacity-20" />
                    </div>
                    <div>
                      <p className="font-serif text-lg font-medium text-foreground">No employees found</p>
                      <p className="text-sm">Adjust filters or search to view results.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors border-none group">
                  <TableCell className="py-4 px-6 align-middle">
                    <Avatar className="h-10 w-10 border border-border shadow-sm rounded-lg overflow-hidden">
                      <AvatarImage
                        src={getPhotoUrl(emp.profile_photo)}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{emp.first_name[0]}{emp.last_name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{emp.full_name}</span>
                      <span className="text-xs text-muted-foreground font-medium">{emp.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-mono font-medium text-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/40 w-fit">{emp.employee_code || "---"}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/80">{emp.employment_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-middle">
                    <Badge variant="outline" className="capitalize font-bold text-[10px] px-2.5 py-0.5 border-border bg-white shadow-none text-muted-foreground">
                      {emp.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-middle">
                    {isArchivedView ? (
                      <div className="text-xs font-medium text-amber-700">
                        {emp.archived_at ? format(new Date(emp.archived_at), "PPP") : "N/A"}
                      </div>
                    ) : (
                      <Badge variant={emp.employment_status === "active" ? "default" : "secondary"} className={emp.employment_status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-none capitalize font-bold text-[10px]" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none shadow-none capitalize font-bold text-[10px]"}>
                        {emp.employment_status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-4 px-6 align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl shadow-xl border-border/60">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 py-2">Account Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/employees/${emp.id}`} className="flex items-center cursor-pointer rounded-lg py-2">
                            <Eye className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">View Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/documents/admin?employee_id=${emp.id}`} className="flex items-center cursor-pointer rounded-lg py-2">
                            <FileText className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">Documents</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1.5" />

                        {isArchivedView ? (
                          <DropdownMenuItem
                            className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer rounded-lg py-2"
                            onClick={() => handleRestore(emp.id, emp.full_name)}
                          >
                            <RotateCcw className="mr-3 h-4 w-4" />
                            <span className="font-medium text-sm">Restore Employee</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer rounded-lg py-2"
                            onClick={() => handleArchive(emp.id, emp.full_name)}
                          >
                            <Archive className="mr-3 h-4 w-4" />
                            <span className="font-medium text-sm">Archive Account</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
