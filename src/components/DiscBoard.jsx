import { useRef, useState } from 'react'
import { DISC_STYLES, MIN_STYLES_TO_PLACE } from '../lib/discGame'
import { IconCheck } from './icons'

// Tablero 3D: la cruz DISC apoyada sobre la mesa en perspectiva. Los brazos
// tienen grosor extruido, las fichas son piezas con canto que se levantan al
// seleccionarlas, y las fichas ganadas se apilan físicamente en el centro.

const SIZE = {
  sm: { board: 215, token: 28, gap: 5, tilt: 10, label: 'text-[8px]', name: 'text-[9px]', mark: 'text-3xl', chip: 15 },
  md: { board: 305, token: 38, gap: 6, tilt: 14, label: 'text-[10px]', name: 'text-[11px]', mark: 'text-5xl', chip: 19 },
  lg: { board: 385, token: 46, gap: 7, tilt: 14, label: 'text-[11px]', name: 'text-xs', mark: 'text-6xl', chip: 23 }
}

const ARM = {
  D: { area: 'd', rounding: 'rounded-t-[26px]', gradient: 'to bottom', beam: 'bottom-0 left-1/2 -translate-x-1/2 h-7 w-2', beamGradient: 'to bottom' },
  I: { area: 'i', rounding: 'rounded-r-[26px]', gradient: 'to left', beam: 'left-0 top-1/2 -translate-y-1/2 w-7 h-2', beamGradient: 'to left' },
  S: { area: 's', rounding: 'rounded-b-[26px]', gradient: 'to top', beam: 'top-0 left-1/2 -translate-x-1/2 h-7 w-2', beamGradient: 'to top' },
  C: { area: 'c', rounding: 'rounded-l-[26px]', gradient: 'to right', beam: 'right-0 top-1/2 -translate-y-1/2 w-7 h-2', beamGradient: 'to right' }
}

// Fichas repartidas dentro del pozo: roseta con leve desorden, como piezas
// realmente colocadas sobre la mesa.
const STACK_JITTER = [
  { x: 0, y: -2, r: 4 },
  { x: 11, y: 4, r: -9 },
  { x: -11, y: 3, r: 7 },
  { x: 6, y: -11, r: 14 },
  { x: -7, y: -10, r: -13 },
  { x: 1, y: 12, r: -4 }
]

function darken(hex, amount) {
  const n = parseInt(hex.slice(1), 16)
  const f = 1 - amount
  return `rgb(${Math.round(((n >> 16) & 255) * f)}, ${Math.round(((n >> 8) & 255) * f)}, ${Math.round((n & 255) * f)})`
}

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

export default function DiscBoard({
  team,
  rounds = [],
  totalRounds = 6,
  selectable = false,
  selectedIds = [],
  onToggle = () => {},
  pendingCanPlace = false,
  size = 'md'
}) {
  const dim = SIZE[size] || SIZE.md
  const [tilt, setTilt] = useState({ x: dim.tilt, y: 0 })
  const wrapRef = useRef(null)

  const selected = new Set(selectedIds)
  const groups = DISC_STYLES.map((s) => ({ ...s, members: team.participants.filter((p) => p.style === s.id) }))
  const unassigned = team.participants.filter((p) => !p.style)
  const placed = rounds.filter((r) => r?.placed)
  const activeStyles = new Set(team.participants.filter((p) => selected.has(p.id) && p.style).map((p) => p.style))

  const handleMove = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: dim.tilt - py * 9, y: px * 11 })
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div
        ref={wrapRef}
        className="perspective w-full"
        style={{ maxWidth: dim.board }}
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt({ x: dim.tilt, y: 0 })}
      >
        <div
          className="preserve-3d relative"
          style={{
            display: 'grid',
            width: '100%',
            aspectRatio: '1 / 1',
            gridTemplateColumns: '1fr 1.45fr 1fr',
            gridTemplateRows: '1fr 1.45fr 1fr',
            gridTemplateAreas: `". d ." "c x i" ". s ."`,
            gap: dim.gap,
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: 'transform 260ms ease-out'
          }}
        >
          {/* Sombra proyectada en la mesa */}
          <div
            className="pointer-events-none absolute inset-x-[18%] bottom-[6%] h-[14%] rounded-[50%] bg-slate-900/20 blur-md"
            style={{ transform: 'translateZ(-18px)' }}
          />

          {groups.map((g) => {
            const cfg = ARM[g.id]
            const active = activeStyles.has(g.id)
            return (
              <div
                key={g.id}
                className={`preserve-3d relative flex flex-col items-center justify-center gap-1 p-1.5 transition-all duration-300 ${cfg.rounding}`}
                style={{
                  gridArea: cfg.area,
                  transform: `translateZ(${active ? 14 : 8}px)`,
                  background: active
                    ? `linear-gradient(${cfg.gradient}, ${g.color}47, ${g.color}18)`
                    : `linear-gradient(${cfg.gradient}, ${g.color}22, ${g.color}0d)`,
                  border: `1.5px solid ${active ? `${g.color}c4` : `${g.color}4d`}`,
                  boxShadow: active
                    ? `0 9px 0 ${g.color}59, 0 20px 26px rgba(2,6,23,0.22), inset 0 0 26px ${g.color}38`
                    : `0 7px 0 ${g.color}33, 0 14px 20px rgba(2,6,23,0.12)`
                }}
              >
                {/* Letra grabada en el tablero */}
                <span
                  className={`pointer-events-none absolute font-extrabold ${dim.mark} transition-opacity duration-300`}
                  style={{ color: g.color, opacity: active ? 0.18 : 0.09 }}
                >
                  {g.id}
                </span>

                <span
                  className={`relative z-10 font-bold uppercase tracking-wider ${dim.label} transition-opacity`}
                  style={{ color: g.color, opacity: active ? 1 : 0.75, transform: 'translateZ(4px)' }}
                >
                  {g.label}
                </span>

                <div className="preserve-3d relative z-10 flex flex-wrap items-center justify-center gap-1">
                  {g.members.length === 0 && <span className="text-[9px] text-slate-300">vacío</span>}
                  {g.members.map((p) => (
                    <Token
                      key={p.id}
                      person={p}
                      color={g.color}
                      dim={dim}
                      active={selected.has(p.id)}
                      selectable={selectable}
                      onClick={() => onToggle(p.id)}
                    />
                  ))}
                </div>

                {/* Haz hacia el punto de encuentro */}
                <span
                  className={`absolute rounded-full transition-opacity duration-300 ${cfg.beam} ${
                    active ? 'animate-beam-glow opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    background: `linear-gradient(${cfg.beamGradient}, ${g.color}, transparent)`,
                    boxShadow: active ? `0 0 14px ${g.color}` : 'none',
                    transform: 'translateZ(6px)'
                  }}
                />
              </div>
            )
          })}

          {/* Punto de encuentro: pozo hundido en el tablero */}
          <div className="preserve-3d relative grid place-items-center" style={{ gridArea: 'x' }}>
            {pendingCanPlace && (
              <>
                <span className="absolute inset-2 animate-pulse-ring rounded-full bg-teal-400/25" />
                <span
                  className="absolute inset-2 animate-pulse-ring rounded-full bg-teal-400/20"
                  style={{ animationDelay: '0.6s' }}
                />
              </>
            )}

            <div
              className={`preserve-3d relative grid h-full w-full place-items-center rounded-full border-2 transition-all duration-300 ${
                pendingCanPlace ? 'border-teal-400 bg-teal-50/80' : 'border-slate-200 bg-slate-50/90'
              }`}
              style={{
                transform: 'translateZ(2px)',
                boxShadow: pendingCanPlace
                  ? 'inset 0 8px 18px rgba(13,148,136,0.22), 0 0 26px rgba(20,184,166,0.35)'
                  : 'inset 0 8px 16px rgba(2,6,23,0.14)'
              }}
            >
              <span className="pointer-events-none absolute inset-[9%] rounded-full border border-slate-300/50" />
              <span className="pointer-events-none absolute inset-[21%] rounded-full border border-slate-200/70" />

              {/* Rótulo grabado en el borde superior del pozo */}
              <span
                className={`pointer-events-none absolute top-[13%] text-center text-[8px] font-bold uppercase leading-tight tracking-wider transition-colors ${
                  pendingCanPlace ? 'text-teal-700' : 'text-slate-400'
                }`}
                style={{ transform: 'translateZ(4px)' }}
              >
                Punto de
                <br />
                Encuentro
              </span>

              {/* Fichas ganadas, apiladas de verdad en el centro */}
              <div className="preserve-3d pointer-events-none absolute inset-0 grid place-items-center">
                {placed.map((_, i) => {
                  const j = STACK_JITTER[i % STACK_JITTER.length]
                  const spread = dim.chip / 17
                  // La posición 3D va en el contenedor y la animación dentro, para
                  // que el `transform` de la animación no anule el translateZ.
                  return (
                    <span
                      key={i}
                      className="preserve-3d absolute"
                      style={{
                        marginLeft: j.x * spread,
                        marginTop: j.y * spread,
                        transform: `translateZ(${9 + i * 3}px) rotate(${j.r}deg)`
                      }}
                    >
                      <span
                        className="block animate-chip-drop rounded-full"
                        style={{
                          width: dim.chip,
                          height: dim.chip,
                          animationDelay: `${i * 90}ms`,
                          background: 'radial-gradient(circle at 34% 28%, #5eead4, #0d9488)',
                          boxShadow: `0 2px 0 ${darken('#0d9488', 0.3)}, 0 4px 0 ${darken('#0d9488', 0.5)}, 0 8px 10px rgba(2,6,23,0.3), inset 0 0 0 2px rgba(255,255,255,0.35)`
                        }}
                      />
                    </span>
                  )
                })}
              </div>

              {/* Marcador al pie del pozo */}
              <div
                className="pointer-events-none absolute bottom-[11%] flex flex-col items-center gap-0.5"
                style={{ transform: 'translateZ(6px)' }}
              >
                {rounds.length > 0 && (
                  <span className="tabular rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-teal-700 shadow-sm ring-1 ring-teal-100">
                    {placed.length}/{totalRounds}
                  </span>
                )}
                {pendingCanPlace && (
                  <span className="text-[8px] font-bold uppercase tracking-wide text-teal-600">¡Listo!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contador de estilos en juego */}
      {selectable && (
        <div className="mt-4 flex items-center gap-1.5">
          {DISC_STYLES.map((s) => (
            <span
              key={s.id}
              className="h-1.5 w-7 rounded-full transition-all duration-300"
              style={{
                background: activeStyles.has(s.id) ? s.color : '#e2e8f0',
                boxShadow: activeStyles.has(s.id) ? `0 0 10px ${s.color}88` : 'none'
              }}
            />
          ))}
          <span
            className={`ml-1.5 text-[11px] font-bold ${
              activeStyles.size >= MIN_STYLES_TO_PLACE ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            {activeStyles.size}/{MIN_STYLES_TO_PLACE}
          </span>
        </div>
      )}

      {unassigned.length > 0 && (
        <div className="perspective mt-3 flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sin ficha</span>
          {unassigned.map((p) => (
            <Token
              key={p.id}
              person={p}
              color="#94a3b8"
              dim={dim}
              active={selected.has(p.id)}
              selectable={selectable}
              onClick={() => onToggle(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Token({ person, color, dim, active, selectable, onClick }) {
  const edge = darken(color, 0.32)
  const edgeDeep = darken(color, 0.5)

  return (
    <button
      type="button"
      disabled={!selectable}
      onClick={onClick}
      title={person.name}
      className={`relative grid shrink-0 place-items-center rounded-full font-extrabold transition-all duration-300 ${dim.name} ${
        selectable ? 'cursor-pointer' : 'cursor-default'
      } ${active && selectable ? 'animate-chip-idle' : ''}`}
      style={{
        width: dim.token,
        height: dim.token,
        transform: active ? 'translateZ(30px)' : 'translateZ(12px)',
        background: active
          ? `radial-gradient(circle at 34% 26%, ${color}, ${darken(color, 0.12)})`
          : 'radial-gradient(circle at 34% 26%, #ffffff, #e9edf3)',
        color: active ? '#fff' : color,
        boxShadow: active
          ? `0 3px 0 ${edge}, 0 6px 0 ${edgeDeep}, 0 16px 20px rgba(2,6,23,0.4), inset 0 0 0 2.5px rgba(255,255,255,0.45)`
          : `0 3px 0 #cbd5e1, 0 5px 0 #94a3b8, 0 10px 14px rgba(2,6,23,0.22), inset 0 0 0 2.5px ${color}`
      }}
    >
      {initials(person.name)}
      {active && (
        <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-teal-500 text-white shadow-md">
          <IconCheck className="h-2.5 w-2.5" />
        </span>
      )}
    </button>
  )
}
