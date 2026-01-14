"use client";

import { useEmployees } from "@/hooks/use-employee";
import { AdminEmployeeTable } from "@/components/employees/admin-employee-table";
import { EmployeeCreateForm } from "@/components/employees/create-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Users,
  Archive,
  UserCheck
} from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { usePagination } from "@/hooks/use-pagination";

export default function AdminEmployeesPage() {
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

  const [open, setOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { data, isLoading } = useEmployees({
    skip,
    limit,
    search,
    archived: showArchived
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-serif font-medium text-foreground tracking-tight">Employee Directory</h3>
          <p className="text-sm text-muted-foreground">Manage organization staff and access control.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              "font-medium transition-all duration-300 px-6",
              showArchived ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : ""
            )}
          >
            {showArchived ? (
              <>
                <UserCheck className="mr-2 h-4 w-4" /> View Active
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" /> View Archives
              </>
            )}
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold px-6 shadow-md active:scale-95 transition-all">
                <Plus className="mr-2 h-4 w-4" /> New Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] border shadow-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter comprehensive details to create a new employee record and system account.
                </DialogDescription>
              </DialogHeader>
              <EmployeeCreateForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or employee code..."
            className="pl-10 h-11 bg-background border-border/60 focus:ring-primary/20 transition-all text-sm"
            defaultValue={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <AdminEmployeeTable
            employees={data?.items || []}
            totalCount={data?.total || 0}
            pageSize={pageSize}
            pageIndex={pageIndex}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onSearch={onSearch}
            isArchivedView={showArchived}
          />
        </div>
      )}
    </div>
  );
}
