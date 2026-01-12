
"use client"

import * as React from "react"

export type ToastVariant = "default" | "destructive" | "success"

export interface Toast {
    id: string
    title?: string
    description?: string
    variant?: ToastVariant
}

type ToastAction =
    | { type: "ADD_TOAST"; toast: Toast }
    | { type: "REMOVE_TOAST"; id: string }

const toastEvents = new Set<(action: ToastAction) => void>()

export function useToast() {
    const toast = ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9)
        const toastAction: ToastAction = {
            type: "ADD_TOAST",
            toast: { id, title, description, variant }
        }
        toastEvents.forEach(cb => cb(toastAction))

        // Auto remove
        setTimeout(() => {
            toastEvents.forEach(cb => cb({ type: "REMOVE_TOAST", id }))
        }, 5000)

        return id
    }

    return {
        toast,
        dismiss: (id: string) => {
            toastEvents.forEach(cb => cb({ type: "REMOVE_TOAST", id }))
        }
    }
}

export function useToastEvents(callback: (action: ToastAction) => void) {
    React.useEffect(() => {
        toastEvents.add(callback)
        return () => {
            toastEvents.delete(callback)
        }
    }, [callback])
}
