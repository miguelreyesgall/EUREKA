import { useEffect, useState } from 'react'

// Cronometro circular del reto. Cambia de color segun urgencia y late cuando
// quedan menos de 30 segundos.

const TOTAL = 240

export default function RoundTimer({ resetKey }) {
  const [seconds, setSeconds] = useState(TOTAL)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    setSeconds(TOTAL)
    setRunning(false)
  }, [resetKey])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [running])

  useEffect(() => {
    if (seconds === 0) setRunning(false)
  }, [seconds])

  const pct = seconds / TOTAL
  const color = seconds <= 30 ? '#e11d48' : seconds <= 75 ? '#f59e0b' : '#14b8a6'
  const urgent = seconds <= 30 && seconds > 0

  const r = 34
  const circumference = 2 * Math.PI * r
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="flex items-center gap-3">
      <div className={`relative h-[86px] w-[86px] shrink-0 ${urgent && running ? 'animate-pulse' : ''}`}>
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="tabular text-lg font-extrabold tracking-tight" style={{ color }}>
            {mm}:{ss}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <button onClick={() => setRunning((v) => !v)} className={`btn-sm ${running ? 'btn-ghost' : 'btn-primary'}`}>
          {running ? '⏸ Pausar' : seconds === TOTAL ? '▶ Iniciar reto' : '▶ Reanudar'}
        </button>
        <button
          onClick={() => {
            setSeconds(TOTAL)
            setRunning(false)
          }}
          className="btn-ghost btn-sm"
        >
          ↺ Reiniciar
        </button>
      </div>
    </div>
  )
}
