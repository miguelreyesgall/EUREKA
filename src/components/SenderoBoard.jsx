import { PATH_LENGTH, SUMMIT } from '../lib/mandoIntegro'

// El sendero de 18 casillas, de la Base a la Cumbre. Serpentea igual que el
// tablero físico: 1-6 abajo, 12-7 en el medio, 13-18 arriba.

const ROWS = [
  [13, 14, 15, 16, 17, 18],
  [12, 11, 10, 9, 8, 7],
  [1, 2, 3, 4, 5, 6]
]

export default function SenderoBoard({ position = 0, size = 'md' }) {
  const maxCell = size === 'sm' ? 34 : 46
  const reached = (n) => position >= n
  const isCurrent = (n) => position === n

  return (
    <div className="w-full">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="section-title">El sendero</span>
        <span className="chip bg-slate-100 text-slate-600">
          Casilla {position} de {PATH_LENGTH}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-emerald-50/60 to-white p-4">
        <div className="mb-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-emerald-700">
          🏔️ Cumbre
        </div>
        <div className="flex flex-col gap-2">
          {ROWS.map((row, ri) => (
            <div key={ri} className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {row.map((n) => {
                const done = reached(n)
                const current = isCurrent(n)
                const summit = n === SUMMIT
                return (
                  <div
                    key={n}
                    className={`relative mx-auto grid aspect-square w-full place-items-center rounded-xl border-2 text-[11px] font-extrabold transition-all duration-500 ${
                      current
                        ? 'scale-110 border-brand-500 bg-brand-600 text-white shadow-lift'
                        : done
                          ? 'border-teal-300 bg-teal-500/15 text-teal-700'
                          : summit
                            ? 'border-amber-300 bg-amber-400/15 text-amber-600'
                            : 'border-slate-200 bg-white text-slate-400'
                    }`}
                    style={{ maxWidth: maxCell }}
                    title={summit ? 'Cumbre' : `Casilla ${n}`}
                  >
                    {summit && !current ? '🏔️' : n}
                    {current && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-base drop-shadow">📍</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="mt-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">Base</div>
      </div>
    </div>
  )
}
