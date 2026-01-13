"use client"

import Link from "next/link";
import { Building2, Database, Palmtree, CalendarDays } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SettingsNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard/settings/admin/company", label: "Company Profile", icon: Building2 },
        { href: "/dashboard/settings/admin/master-data", label: "Master Data", icon: Database },
        { href: "/dashboard/settings/admin/leaves", label: "Leave Policies", icon: Palmtree },
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
