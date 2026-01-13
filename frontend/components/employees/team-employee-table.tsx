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
import { Eye, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui/card";

interface TeamEmployeeTableProps {
  employees: Employee[];
}

export function TeamEmployeeTable({ employees }: TeamEmployeeTableProps) {
  return (
    <Card className="bg-background border shadow-sm flex flex-col min-h-[400px]">
      <div className="overflow-auto max-h-[600px] flex-1">
        <Table>
          <TableHeader className="bg-muted/90 backdrop-blur-sm text-muted-foreground [&_th]:font-medium [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider sticky top-0 z-10 shadow-sm">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="w-[80px] py-4 px-6 align-middle">Photo</TableHead>
              <TableHead className="py-4 px-6 align-middle">Employee</TableHead>
              <TableHead className="py-4 px-6 align-middle">Employment</TableHead>
              <TableHead className="py-4 px-6 align-middle">Contact</TableHead>
              <TableHead className="py-4 px-6 align-middle">Status</TableHead>
              <TableHead className="text-right py-4 px-6 align-middle">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-medium">No team members found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors border-none group">
                  <TableCell className="py-4 px-6 align-middle">
                    <Avatar className="h-10 w-10 border border-border shadow-sm">
                      <AvatarImage
                        src={emp.profile_photo ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/uploads/${emp.profile_photo}` : undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">{emp.first_name[0]}{emp.last_name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{emp.full_name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{emp.employee_code || "---"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-middle">
                    <span className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">{emp.employment_type}</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-middle">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] flex items-center font-medium text-muted-foreground">
                        <Mail className="mr-2 h-3 w-3 text-primary/60" /> {emp.email}
                      </span>
                      {emp.phone && (
                        <span className="text-[10px] flex items-center font-medium text-muted-foreground">
                          <Phone className="mr-2 h-3 w-3 text-primary/60" /> {emp.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-middle">
                    <Badge variant={emp.employment_status === "active" ? "default" : "secondary"} className={emp.employment_status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-none capitalize" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none shadow-none capitalize"}>
                      {emp.employment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6 align-middle">
                    <Button variant="ghost" size="sm" asChild className="h-8 px-3 rounded-md hover:bg-primary/10 hover:text-primary transition-all text-[11px] font-medium border border-transparent hover:border-primary/20">
                      <Link href={`/dashboard/employees/${emp.id}`}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View Profile
                      </Link>
                    </Button>
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
