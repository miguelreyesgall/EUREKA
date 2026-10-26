import { BALANCE_MAX, DIMENSIONS, balanceSpread, equilibriumBand, isBalanced } from '../lib/mandoIntegro'
import { IconCheck } from './icons'

// La Balanza: tres columnas (Cabeza, Corazón, Manos) con la zona de equilibrio
// resaltada. Mientras las tres se mantengan dentro de la banda, el equipo gana
// un paso extra en el sendero.

export default function Balanza({ balance, highlight = null, size = 'md' }) {
  const balanced = isBalanced(balance)
  const spread = balanceSpread(balance)
  const band = equilibriumBand(balance)

  const barsH = size === 'sm' ? 130 : 180
  const colW = size === 'sm' ? 40 : 56
  const pct = (v) => (v / BALANCE_MAX) * 100

  return (
    <div className="w-full">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="section-title">La Balanza</span>
        <span
          className={`chip ${balanced ? 'bg-teal-500/10 text-teal-700' : 'bg-amber-400/15 text-amber-600'}`}
          title="Diferencia entre la columna más alta y la más baja"
        >
          {balanced ? (
            <>
              <IconCheck className="h-3 w-3" /> En equilibrio
            </>
          ) : (
            <>⚠️ Inclinada · {spread}</>
          )}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
        {/* Zona de columnas: la banda y las barras comparten la misma referencia */}
        <div className="relative" style={{ height: barsH }}>
          <div
            className={`pointer-events-none absolute inset-x-0 rounded-lg border-y-2 border-dashed transition-all duration-500 ${
              balanced ? 'border-teal-300 bg-teal-400/10' : 'border-slate-300 bg-slate-400/5'
            }`}
            style={{ bottom: `${pct(band.min)}%`, height: `${Math.max(pct(band.max - band.min), 3)}%` }}
          >
            <span
              className={`absolute -top-4 right-0 text-[8px] font-bold uppercase tracking-wider ${
                balanced ? 'text-teal-600' : 'text-slate-400'
              }`}
            >
              zona de equilibrio
            </span>
          </div>

          <div className="absolute inset-0 flex items-end justify-center gap-4">
            {DIMENSIONS.map((d) => {
              const value = balance?.[d.id] ?? 0
              const isHighlighted = highlight === d.id
              return (
                <div key={d.id} className="relative" style={{ width: colW, height: `${pct(value)}%` }}>
                  <div
                    className="h-full w-full rounded-t-lg transition-all duration-500"
                    style={{
                      background: `linear-gradient(to top, ${d.color}, ${d.color}b3)`,
                      boxShadow: isHighlighted
                        ? `0 0 0 3px ${d.color}44, 0 -4px 16px ${d.color}66`
                        : 'inset 0 -3px 0 rgba(0,0,0,0.18)'
                    }}
                  />
                  <span
                    className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-extrabold"
                    style={{ color: d.color }}
                  >
                    {value}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Etiquetas */}
        <div className="mt-2.5 flex justify-center gap-4">
          {DIMENSIONS.map((d) => {
            const value = balance?.[d.id] ?? 0
            const inBand = value >= band.min - 0.5 && value <= band.max + 0.5
            return (
              <div key={d.id} className="flex flex-col items-center" style={{ width: colW }}>
                <span
                  className="grid h-6 w-6 place-items-center rounded-lg text-[10px] font-extrabold text-white transition-opacity"
                  style={{ background: d.color, opacity: inBand ? 1 : 0.55 }}
                >
                  {d.label[0]}
                </span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">{d.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
