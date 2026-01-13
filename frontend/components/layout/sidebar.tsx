"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarDays,
  Briefcase,
  Settings,
  LogOut,
  Gift,
  PieChart
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { logout } from "@/lib/api";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Leave", href: "/dashboard/leaves", icon: CalendarDays },
  { name: "Reviews", href: "/dashboard/reviews", icon: PieChart },
  { name: "Celebrations", href: "/dashboard/celebrations", icon: Gift },
  { name: "Recruitment", href: "/dashboard/recruitment", icon: Briefcase },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const normalizePath = (path: string) =>
    path.replace(/\/$/, "");

  const isActive = (itemHref: string, pathname: string) => {
    const current = normalizePath(pathname);
    const target = normalizePath(itemHref);

    // Exact match
    if (current === target) return true;

    // Child route match (but exclude dashboard root)
    if (
      target !== "/dashboard" &&
      current.startsWith(target + "/")
    ) {
      return true;
    }

    return false;
  };


  return (
    <div className="flex h-full w-64 flex-col border-r bg-background/50 backdrop-blur-xl">
      <div className="flex h-16 items-center px-6 border-b">
        <Logo />
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="border-t p-4">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
