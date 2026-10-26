import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { EmptyState, PageHeader, ProgressBar, StatCard } from '../components/ui'
import { IconChart, IconSparkles, IconTarget, IconTrophy } from '../components/icons'
import { useCompanySessions } from '../lib/store'
import { computeDiscReport, DISC_STYLES } from '../lib/discGame'
import { computeMandoReport } from '../lib/mandoIntegro'
import { GAME_MAP } from '../lib/games'
import { sessionComposition, sessionPeople } from '../lib/sessions'

export default function Analytics() {
  const navigate = useNavigate()
  const sessions = useCompanySessions()
  const completed = useMemo(() => sessions.filter((s) => s.status === 'completed'), [sessions])

  // El agregado de fichas/estilos solo aplica a Código DISC; Mando Íntegro
  // tiene su propia métrica y se resume en su tarjeta.
  const { reports, aggregate } = useMemo(() => {
    const disc = completed.filter((s) => s.gameId === 'codigo-disc')
    const reports = new Map(disc.map((s) => [s.id, computeDiscReport(s)]))
    if (!disc.length) return { reports, aggregate: null }
    const list = [...reports.values()]
    const totalPlaced = list.reduce((n, r) => n + r.totalPlaced, 0)
    const totalRounds = list.reduce((n, r) => n + r.totalRounds, 0)
    const styleTotals = Object.fromEntries(DISC_STYLES.map((s) => [s.id, 0]))
    for (const r of list) for (const s of DISC_STYLES) styleTotals[s.id] += r.styleParticipation[s.id] || 0
    const topStyle = DISC_STYLES.map((s) => ({ ...s, count: styleTotals[s.id] })).sort((a, b) => b.count - a.count)[0]
    return { reports, aggregate: { totalPlaced, totalRounds, topStyle, styleTotals } }
  }, [completed])

  const fmt = (d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <AppShell>
      <PageHeader
        title="Analítica"
        description="Reportes generados automáticamente al cerrar cada dinámica, con análisis de IA incluido."
      />

      {aggregate && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Reportes disponibles" value={completed.length} Icon={IconChart} color="#4f46e5" />
            <StatCard
              label="Fichas colocadas"
              value={aggregate.totalPlaced}
              suffix={`/ ${aggregate.totalRounds}`}
              Icon={IconTarget}
              color="#0d9488"
              hint={`${Math.round((aggregate.totalPlaced / (aggregate.totalRounds || 1)) * 100)}% de efectividad global`}
            />
            <StatCard
              label="Estilo más presente"
              value={aggregate.topStyle.id}
              suffix={aggregate.topStyle.label}
              emoji="🧠"
              color={aggregate.topStyle.color}
            />
          </div>

          <div className="card mt-4 p-6">
            <h2 className="section-title">Participación acumulada por estilo</h2>
            <p className="mt-1 text-xs text-slate-400">Suma de apariciones en rondas resueltas con éxito en todas las sesiones.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {DISC_STYLES.map((s) => {
                const value = aggregate.styleTotals[s.id] || 0
                const max = Math.max(1, ...Object.values(aggregate.styleTotals))
                return (
                  <div key={s.id} className="panel">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-bold text-white" style={{ background: s.color }}>
                          {s.id}
                        </span>
                        {s.label}
                      </span>
                      <span className="text-sm font-extrabold text-slate-800">{value}</span>
                    </div>
                    <ProgressBar className="mt-2.5" value={value} max={max} color={s.color} />
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <div className="mt-8">
        <h2 className="section-title mb-3">Reportes por sesión</h2>
        {completed.length === 0 ? (
          <EmptyState
            emoji="📊"
            title="Aún no hay reportes"
            description="Juega y cierra una sesión de Código DISC para ver aquí su reporte grupal, individual y el análisis de IA."
            action={
              <Link to="/app/juegos" className="btn-primary">
                Ir al marketplace
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {completed.map((s) => {
              const game = GAME_MAP[s.gameId]
              const isMando = s.gameId === 'mando-integro'
              const report = isMando ? computeMandoReport(s) : reports.get(s.id)
              return (
                <div key={s.id} className="card card-hover p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
                        style={{ background: `${game?.color || '#64748b'}14` }}
                      >
                        {game?.icon || '🎲'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-bold text-slate-900">{s.name}</h3>
                          {isMando ? (
                            <span className="chip bg-sky-50 capitalize text-sky-700">
                              {report.ending === 'equilibrado' ? '⚖️' : '😮‍💨'} {report.ending}
                            </span>
                          ) : (
                            <span className="chip bg-amber-400/15 text-amber-600">
                              <IconTrophy className="h-3 w-3" />
                              {report.winners.map((w) => w.name).join(' y ') || 'Sin ganador'}
                            </span>
                          )}
                          <span className="chip bg-brand-50 text-brand-700">
                            <IconSparkles className="h-3 w-3" />
                            Insight IA
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span>Cerrada {fmt(s.completedAt)}</span>
                          <span className="text-slate-300">·</span>
                          <span>{sessionComposition(s)}</span>
                          <span className="text-slate-300">·</span>
                          <span>
                            {isMando
                              ? `${report.bonusRounds}/${report.totalRounds} turnos en equilibrio`
                              : `${report.totalPlaced}/${report.totalRounds} fichas`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/app/sesion/${s.id}/reporte`)} className="btn-primary btn-sm shrink-0">
                      Ver reporte
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
