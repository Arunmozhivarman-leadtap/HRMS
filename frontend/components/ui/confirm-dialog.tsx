"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { SimpleDialog } from "./simple-dialog"
import { Button } from "./button"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <SimpleDialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800">
           <AlertTriangle className="h-5 w-5 flex-shrink-0" />
           <p className="text-sm leading-relaxed">{description}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading}
            className="text-xs h-10 px-6"
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
            className="text-xs h-10 px-8 font-bold shadow-sm"
          >
            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </SimpleDialog>
  )
}
