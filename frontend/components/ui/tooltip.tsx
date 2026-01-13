import React from 'react'
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
}

export function Tooltip({ children, content, className }: TooltipProps) {
  if (!content) return <>{children}</>

  return (
    <div className={cn("relative flex items-center justify-center group/tooltip w-full h-full", className)}>
      {children}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:block px-3 py-2 bg-white text-zinc-900 border border-zinc-200 shadow-2xl rounded-xl z-50 animate-in fade-in slide-in-from-bottom-1 duration-200 min-w-max pointer-events-none">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white drop-shadow-sm"></div>
      </div>
    </div>
  )
}
