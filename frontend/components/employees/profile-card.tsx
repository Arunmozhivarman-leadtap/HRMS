"use client";

import { Employee } from "@/types/employee";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, User, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { ProfilePhotoUploader } from "./profile-photo-uploader";
import { useUser } from "@/hooks/use-user";

interface EmployeeProfileCardProps {
  employee: Employee;
}

export function EmployeeProfileCard({ employee }: EmployeeProfileCardProps) {
  const { user: currentUser } = useUser();
  const isSelf = currentUser?.employee_id === employee.id;
  const isAdmin = currentUser?.role === "super_admin" || currentUser?.role === "hr_admin";

  const canEditPhoto = isSelf || isAdmin;

  return (
    <Card className="bg-background border shadow-sm rounded-2xl overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-muted/20 to-muted/40 border-b border-border/40 relative">
        {isAdmin && (
          <div className="absolute top-4 right-6">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-emerald-200 text-emerald-700 py-1 px-3 shadow-sm flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3" />
              Admin Verified Profile
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="relative px-10 pb-10">
        <div className="flex flex-col items-center -mt-16 sm:flex-row sm:items-end sm:space-x-8">
          <ProfilePhotoUploader
            employeeId={employee.id}
            currentPhoto={employee.profile_photo}
            fullName={employee.full_name}
            isEditable={canEditPhoto}
          />

          <div className="mt-6 sm:mt-0 pb-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-3xl font-serif font-medium text-foreground tracking-tight">{employee.full_name}</h1>
              <Badge variant="outline" className="w-fit mx-auto sm:mx-0 capitalize font-bold text-[10px] px-2.5 py-0.5 border-border bg-muted/30 text-muted-foreground tracking-widest">
                {employee.role.replace("_", " ")}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-muted/40 rounded-lg border border-border/40">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Emp Code</span>
                <span className="text-xs font-mono font-bold text-foreground">
                  {employee.employee_code || "N/A"}
                </span>
              </div>

              <Badge variant={employee.employment_status === "active" ? "default" : "secondary"} className={employee.employment_status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none shadow-none capitalize font-bold text-[10px] px-4 py-1.5 rounded-full" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none shadow-none capitalize font-bold text-[10px] px-4 py-1.5 rounded-full"}>
                {employee.employment_status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-10 border-t border-border/40">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50 flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> Work Email
            </p>
            <p className="text-sm font-medium text-foreground truncate">{employee.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50 flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> Primary Mobile
            </p>
            <p className="text-sm font-medium text-foreground">{employee.phone || "Not shared"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Date of Joining
            </p>
            <p className="text-sm font-medium text-foreground">
              {employee.date_of_joining ? format(new Date(employee.date_of_joining), "PPP") : "Pending Data"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
