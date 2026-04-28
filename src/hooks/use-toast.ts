'use client'

import * as React from 'react'
import { toast as sonnerToast } from 'sonner'

type ToastVariant = 'default' | 'destructive'

type ToastInput = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  action?: React.ReactNode
  duration?: number
}

type ToastHandle = {
  id: string | number
  dismiss: () => void
  update: (next: ToastInput) => void
}

const getMessage = ({ title, description }: ToastInput) => {
  if (title) {
    return title
  }

  if (description) {
    return description
  }

  return ''
}

const getOptions = ({ title, description, action, duration }: ToastInput) => ({
  description: title ? description : undefined,
  action,
  duration,
})

function showToast(input: ToastInput, id?: string | number) {
  const message = getMessage(input)
  const options = {
    ...getOptions(input),
    ...(id ? { id } : {}),
  }

  if (input.variant === 'destructive') {
    return sonnerToast.error(message, options)
  }

  return sonnerToast(message, options)
}

function toast(input: ToastInput): ToastHandle {
  const id = showToast(input)

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (next) => {
      showToast(next, id)
    },
  }
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => {
      if (toastId === undefined) {
        sonnerToast.dismiss()
        return
      }

      sonnerToast.dismiss(toastId)
    },
  }
}

export { useToast, toast }
