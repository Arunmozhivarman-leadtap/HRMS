
"use client"

import * as React from "react"
import { useToastEvents, type Toast } from "@/hooks/use-toast"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    useToastEvents(React.useCallback((action) => {
        if (action.type === "ADD_TOAST") {
            setToasts((prev) => [...prev, action.toast])
        } else if (action.type === "REMOVE_TOAST") {
            setToasts((prev) => prev.filter((t) => t.id !== action.id))
        }
    }, []))

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
            ))}
        </div>
    )
}

function ToastItem({ toast, onRemove }: { toast: Toast, onRemove: (id: string) => void }) {
    return (
        <div
            className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all animate-in fade-in slide-in-from-right-full",
                toast.variant === "destructive"
                    ? "border-rose-200 bg-rose-50 text-rose-900"
                    : toast.variant === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-zinc-200 bg-white text-zinc-950"
            )}
        >
            <div className="flex items-start gap-3">
                {toast.variant === "destructive" && <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />}
                {toast.variant === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
                {toast.variant === "default" && <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />}

                <div className="grid gap-1 text-sm">
                    {toast.title && <div className="font-semibold">{toast.title}</div>}
                    {toast.description && (
                        <div className="opacity-90 leading-relaxed text-xs">{toast.description}</div>
                    )}
                </div>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2"
            >
                <X className="h-4 w-4 opacity-50 hover:opacity-100" />
            </button>
        </div>
    )
}
