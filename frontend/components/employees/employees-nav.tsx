"use client"

import Link from "next/link";
import { User, Users, ShieldAlert, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface EmployeesNavProps {
    isManager: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

export function EmployeesNav({ isManager, isAdmin, isSuperAdmin }: EmployeesNavProps) {
    const pathname = usePathname();

    const navItems = [
        ...(isSuperAdmin ? [] : [{ href: "/dashboard/employees/me", label: "My Profile", icon: User }]),
        ...(isManager ? [{ href: "/dashboard/employees/manager", label: "Team Desk", icon: Users }] : []),
        ...(isAdmin ? [{ href: "/dashboard/employees/admin", label: "Admin Control", icon: ShieldAlert }] : []),
    ];

    return (
        <div className="flex items-center bg-zinc-100/50 p-1 rounded-full border border-zinc-200/50 self-start md:self-auto shadow-sm">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300",
                            isActive
                                ? "bg-white text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                        {item.label}
                    </Link>
                );
            })}
        </div>
    );
}
