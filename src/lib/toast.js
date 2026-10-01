import { useSyncExternalStore } from 'react'

// Store minimo de notificaciones, mismo patron que el store principal.

let toasts = []
const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

function push(message, variant) {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  toasts = [...toasts, { id, message, variant }]
  emit()
  setTimeout(() => dismiss(id), 3600)
  return id
}

export function dismiss(id) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export const toast = {
  success: (message) => push(message, 'success'),
  info: (message) => push(message, 'info'),
  error: (message) => push(message, 'error')
}

export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => toasts,
    () => toasts
  )
}
