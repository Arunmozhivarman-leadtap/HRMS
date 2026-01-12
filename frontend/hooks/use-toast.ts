// Simplified toast hook
import * as React from "react"

type ToastProps = {
    title?: string
    description?: string
    variant?: "default" | "destructive"
}

export function useToast() {
    const [toasts, setToasts] = React.useState<ToastProps[]>([])

    const toast = ({ title, description, variant = "default" }: ToastProps) => {
        // For now, just log to console or alert since we don't have a Toaster component yet
        // In a real app this would dispatch to a global context
        console.log(`Toast: ${title} - ${description} (${variant})`)
        // if (variant === 'destructive' && description) {
        //     console.error(description)
        // }
    }

    return {
        toast,
        toasts,
        dismiss: (id?: string) => {}
    }
}
