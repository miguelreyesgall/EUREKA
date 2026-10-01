import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { generateAIInsights } from '../lib/aiInsights'
import { IconSparkles } from './icons'

export default function AIInsightsPanel({ session, report }) {
  const insights = useMemo(() => generateAIInsights(session, report), [session, report])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const t = setTimeout(() => setReady(true), 1100)
    return () => clearTimeout(t)
  }, [session.id])

  return (
    <div className="card mt-6 overflow-hidden border-brand-200/60">
      <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden bg-gradient-to-r from-brand-800 via-brand-600 to-indigo-500 px-6 py-4 text-white">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <IconSparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-extrabold tracking-tight">Análisis generado por IA</div>
            <div className="text-[11px] text-brand-100">Eureka AI · interpretación automática de la sesión</div>
          </div>
        </div>
        {ready && (
          <div className="relative flex flex-wrap items-center gap-2">
            <span className="chip bg-white/15 text-white backdrop-blur">🔎 {insights.signals} señales</span>
            <span className="chip bg-white/15 text-white backdrop-blur">Confianza {insights.confidence}%</span>
          </div>
        )}
      </div>

      <div className="p-6">
        {!ready ? (
          <ThinkingState />
        ) : (
          <>
            <p className="text-sm leading-relaxed text-slate-700">{insights.summary}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {insights.highlights.map((h, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{h.icon}</span>
                    <span className="text-sm font-bold text-slate-800">{h.title}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{h.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-100 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Balance de estilos vs. equipo ideal
                </h3>
                <div className="mt-2 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={insights.radar} outerRadius="72%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="style" tick={{ fontSize: 11, fill: '#475569' }} />
                      <PolarRadiusAxis domain={[0, 50]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <Radar name="Tu equipo" dataKey="equipo" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.35} />
                      <Radar name="Balance ideal" dataKey="balanceIdeal" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.12} strokeDasharray="4 3" />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Proyección de cohesión de equipo
                </h3>
                <p className="mt-1 text-[11px] text-slate-400">
                  Simulación ilustrativa si el equipo aplica las recomendaciones. No son datos históricos reales.
                </p>
                <div className="mt-2 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={insights.projection} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                      <defs>
                        <linearGradient id="aiCohesion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="cohesion" name="Índice de cohesión" stroke="#4f46e5" fill="url(#aiCohesion)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-brand-50/60 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-500">Recomendaciones de la IA</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {insights.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-brand-500">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-[11px] text-slate-400">
              ✨ Contenido generado automáticamente por IA a partir de los datos de la sesión, con fines
              demostrativos. Es un análisis de apoyo simulado y no reemplaza el criterio de un facilitador humano.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function ThinkingState() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
        <p className="text-sm font-medium text-slate-500">Eureka AI está analizando los patrones de la sesión…</p>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-[92%]" />
        <div className="skeleton h-3 w-[78%]" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 w-full" />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="skeleton h-56 w-full" />
        <div className="skeleton h-56 w-full" />
      </div>
    </div>
  )
}
