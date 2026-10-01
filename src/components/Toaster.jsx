import { dismiss, useToasts } from '../lib/toast'
import { IconCheck, IconClose, IconSparkles } from './icons'

const VARIANT = {
  success: { ring: 'border-teal-200', dot: 'bg-teal-500', Icon: IconCheck },
  info: { ring: 'border-brand-200', dot: 'bg-brand-500', Icon: IconSparkles },
  error: { ring: 'border-coral-200', dot: 'bg-coral-500', Icon: IconClose }
}

export default function Toaster() {
  const toasts = useToasts()
  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => {
        const v = VARIANT[t.variant] || VARIANT.info
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex animate-slide-in-right items-start gap-3 rounded-xl border bg-white p-3.5 shadow-float ${v.ring}`}
          >
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-white ${v.dot}`}>
              <v.Icon className="h-3.5 w-3.5" />
            </span>
            <p className="flex-1 pt-0.5 text-sm font-medium text-slate-700">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-md p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
              aria-label="Cerrar notificación"
            >
              <IconClose className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
