import { useEffect, useRef } from 'react'

// Confeti en canvas, sin dependencias. Se dispara cada vez que cambia `trigger`.
// `intensity` 'burst' para una ficha colocada, 'victory' para el cierre.

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#6366f1', '#14b8a6']

export default function Confetti({ trigger = 0, intensity = 'burst' }) {
  const canvasRef = useRef(null)
  const particles = useRef([])
  const raf = useRef(null)

  useEffect(() => {
    if (!trigger) return
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const w = window.innerWidth
    const count = intensity === 'victory' ? 160 : 70
    const originY = intensity === 'victory' ? -20 : window.innerHeight * 0.38

    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: intensity === 'victory' ? Math.random() * w : w / 2 + (Math.random() - 0.5) * 260,
        y: originY + Math.random() * 40,
        vx: (Math.random() - 0.5) * (intensity === 'victory' ? 5 : 8),
        vy: intensity === 'victory' ? 2 + Math.random() * 3 : -7 - Math.random() * 6,
        size: 5 + Math.random() * 6,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1
      })
    }

    if (raf.current) return

    const tick = () => {
      ctx.clearRect(0, 0, w, window.innerHeight)
      particles.current = particles.current.filter((p) => p.life > 0 && p.y < window.innerHeight + 60)

      for (const p of particles.current) {
        p.vy += 0.22
        p.vx *= 0.995
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life -= 0.0055

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life))
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62)
        ctx.restore()
      }

      if (particles.current.length) {
        raf.current = requestAnimationFrame(tick)
      } else {
        cancelAnimationFrame(raf.current)
        raf.current = null
        ctx.clearRect(0, 0, w, window.innerHeight)
      }
    }
    raf.current = requestAnimationFrame(tick)
  }, [trigger, intensity])

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      particles.current = []
    },
    []
  )

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[80]" />
}
