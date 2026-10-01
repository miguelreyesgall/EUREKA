import { useEffect, useRef, useState } from 'react'
import { MIN_STYLES_TO_PLACE } from '../lib/discGame'

// Mazo de cartas 3D: pila con grosor sobre la mesa. Al robar, la carta superior
// se levanta, gira en el aire y aterriza revelada. Con la carta descubierta el
// cursor la inclina en 3D (parallax).

const STACK = [
  { x: -9, y: 16, rot: -5.5, scale: 0.965, shade: 0.4 },
  { x: 13, y: 12, rot: 4.6, scale: 0.972, shade: 0.3 },
  { x: -5, y: 8, rot: -2.8, scale: 0.982, shade: 0.21 },
  { x: 7, y: 5, rot: 2.2, scale: 0.99, shade: 0.12 },
  { x: -2, y: 2.5, rot: -0.9, scale: 0.996, shade: 0.05 }
]

export default function CardDeck({ deck, card, revealed, onReveal, roundNumber, totalRounds }) {
  const [phase, setPhase] = useState(revealed ? 'revealed' : 'idle') // idle | lifting | revealed
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const wrapRef = useRef(null)
  const timers = useRef([])

  useEffect(() => {
    setPhase(revealed ? 'revealed' : 'idle')
    setTilt({ x: 0, y: 0 })
  }, [revealed, deck.id])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const draw = () => {
    if (phase !== 'idle') return
    setPhase('lifting')
    timers.current.push(setTimeout(() => setPhase('revealed'), 340))
    timers.current.push(setTimeout(() => onReveal(), 1000))
  }

  const handleMove = (e) => {
    if (phase !== 'revealed') return
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: -py * 13, y: px * 15 })
  }

  const cardTransform =
    phase === 'idle'
      ? `translate3d(0,${hovering ? -10 : 0}px,${hovering ? 26 : 0}px) rotateZ(${hovering ? -1.5 : 0}deg) rotateY(0deg)`
      : phase === 'lifting'
        ? 'translate3d(0,-34px,90px) rotateZ(-5deg) rotateY(0deg)'
        : 'translate3d(0,0,10px) rotateZ(0deg) rotateY(180deg)'

  const duration = phase === 'lifting' ? 340 : phase === 'revealed' ? 680 : 320

  return (
    <div className="flex flex-col items-center">
      <div
        ref={wrapRef}
        className="perspective relative w-full max-w-[310px]"
        style={{ aspectRatio: '5 / 7' }}
        onMouseMove={handleMove}
        onMouseLeave={() => {
          setTilt({ x: 0, y: 0 })
          setHovering(false)
        }}
        onMouseEnter={() => setHovering(true)}
      >
        {/* Sombra proyectada en la mesa */}
        <div
          className="absolute inset-x-6 bottom-[-14px] h-6 rounded-[50%] bg-black/45 blur-lg transition-all duration-500"
          style={{ transform: `scale(${phase === 'lifting' ? 0.82 : 1})`, opacity: phase === 'lifting' ? 0.3 : 0.5 }}
        />

        {/* Resto del mazo (grosor) */}
        {STACK.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-2xl bg-white p-1.5 shadow-lg"
            style={{
              transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg) scale(${s.scale})`,
              filter: `brightness(${1 - s.shade})`
            }}
          >
            <div
              className="relative h-full w-full overflow-hidden rounded-xl"
              style={{ background: `radial-gradient(circle at 30% 22%, ${deck.color}, ${deck.color}aa 40%, #070b16 115%)` }}
            >
              <div className="card-back-pattern absolute inset-0 opacity-25" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-black/45" />
            </div>
          </div>
        ))}

        {/* Carta superior: se roba y gira */}
        <div
          className="absolute inset-0 preserve-3d"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: 'transform 220ms ease-out'
          }}
        >
          <div
            className="relative h-full w-full preserve-3d"
            style={{
              transform: cardTransform,
              transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
            }}
          >
            {/* Dorso */}
            <button
              onClick={draw}
              disabled={phase !== 'idle'}
              aria-label="Robar carta del mazo"
              className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl bg-white p-1.5 shadow-float disabled:cursor-default"
            >
              <div
                className="relative h-full w-full overflow-hidden rounded-xl"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${deck.color}, ${deck.color}aa 40%, #070b16 115%)`
                }}
              >
                <div className="card-back-pattern absolute inset-0 opacity-25" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-black/45" />
                <div className="absolute inset-2.5 rounded-lg border-2 border-white/45" />
                <div className="absolute inset-[15px] rounded-md border border-white/20" />
                <div className="relative grid h-full place-items-center text-white">
                  <div className="text-center">
                    <div className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-full border-2 border-white/40 bg-black/25 shadow-inner backdrop-blur-sm">
                      <span className="text-4xl drop-shadow">{deck.icon}</span>
                    </div>
                    <div className="mt-4 text-[9px] font-bold uppercase tracking-[0.42em] text-white/85">Eureka</div>
                    <div className="mx-auto mt-2 h-px w-12 bg-white/40" />
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
                      {deck.label}
                    </div>
                  </div>
                </div>
                {/* Brillo al pasar el cursor */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent transition-opacity duration-300"
                  style={{ opacity: hovering && phase === 'idle' ? 0.85 : 0 }}
                />
              </div>
            </button>

            {/* Cara */}
            <div className="absolute inset-0 rotate-y-180 backface-hidden overflow-hidden rounded-2xl bg-white p-1.5 shadow-float">
              <div
                className="card-paper relative flex h-full w-full flex-col rounded-xl border-2 p-4"
                style={{ borderColor: `${deck.color}66` }}
              >
                {/* Índice superior */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-xl">{deck.icon}</span>
                    <span className="mt-1 text-[10px] font-extrabold" style={{ color: deck.color }}>
                      {roundNumber}
                    </span>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: `${deck.color}1a`, color: deck.color }}
                  >
                    {deck.label}
                  </span>
                </div>

                {/* Situación */}
                <div className="flex flex-1 items-center py-3">
                  <p className="text-base font-semibold leading-snug text-slate-800">“{card}”</p>
                </div>

                <div className="border-t border-dashed pt-2.5" style={{ borderColor: `${deck.color}40` }}>
                  <p className="text-[10px] leading-relaxed text-slate-500">
                    3-5 min · se necesitan {MIN_STYLES_TO_PLACE} estilos distintos participando
                  </p>
                </div>

                {/* Índice inferior invertido */}
                <div className="flex items-end justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">
                    {roundNumber}/{totalRounds}
                  </span>
                  <div className="flex rotate-180 flex-col items-center leading-none">
                    <span className="text-xl">{deck.icon}</span>
                    <span className="mt-1 text-[10px] font-extrabold" style={{ color: deck.color }}>
                      {roundNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie del mazo */}
      <div className="mt-8 text-center">
        {phase === 'idle' ? (
          <>
            <button onClick={draw} className="btn bg-white text-slate-900 shadow-float hover:bg-white/90">
              🃏 Robar carta del mazo
            </button>
            <p className="mt-2.5 text-[11px] text-white/45">o toca el mazo</p>
          </>
        ) : (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
            Mazo {roundNumber} de {totalRounds} · {deck.cards.length - 1} cartas restantes
          </div>
        )}
      </div>
    </div>
  )
}
