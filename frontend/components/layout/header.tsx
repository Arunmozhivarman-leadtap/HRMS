"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/50 backdrop-blur-xl px-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">Rahul Sharma</span>
            <span className="text-xs text-muted-foreground">Software Engineer</span>
          </div>
          <Avatar>
            <AvatarImage src="/avatars/01.png" alt="Rahul" />
            <AvatarFallback>RS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
