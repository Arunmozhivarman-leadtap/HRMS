import React from 'react'
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
  className?: string
}

export function Tooltip({ children, content, className }: TooltipProps) {
  return (
    <div className={cn("relative flex items-center justify-center group", className)}>
      {children}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-zinc-900 text-white text-[10px] font-medium rounded shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900"></div>
      </div>
    </div>
  )
}
