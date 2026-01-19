"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useEmployeeProfile } from "@/hooks/use-employee";
import { Skeleton } from "@/components/ui/skeleton";
import { getPhotoUrl } from "@/lib/utils";

export function Header() {
  const { data: employee, isLoading } = useEmployeeProfile();

  const fullName = employee?.full_name || `${employee?.first_name} ${employee?.last_name}`.trim() || "User";
  const initials = employee?.first_name && employee?.last_name
    ? `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase()
    : employee?.first_name
      ? employee.first_name[0].toUpperCase()
      : "U";

  const photoUrl = getPhotoUrl(employee?.profile_photo);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/50 backdrop-blur-xl px-6">
      <div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex flex-col items-end">
            {isLoading ? (
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : (
              <>
                <span className="text-sm font-medium">{fullName}</span>
                <span className="text-xs text-muted-foreground capitalize">{employee?.role.replace("_", " ") || "Employee"}</span>
              </>
            )}
          </div>
          <Avatar>
            <AvatarImage src={photoUrl} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
