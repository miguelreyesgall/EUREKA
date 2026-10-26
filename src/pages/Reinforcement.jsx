import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { EmptyState, PageHeader, ProgressBar, SectionHeader, StatCard, Tabs } from '../components/ui'
import { IconCheck, IconClock, IconSparkles, IconTarget } from '../components/icons'
import { useCompanySessions } from '../lib/store'
import { DIMENSIONS, DIMENSION_MAP } from '../lib/diagnostic'
import { microlearningPlan } from '../lib/microlearnings'

// Lo que ocurre DESPUÉS de la sesión: los compromisos que cada líder firmó y la
// secuencia de microlearnings enfocada en su dimensión más débil.

export default function Reinforcement() {
  const sessions = useCompanySessions()
  const [tab, setTab] = useState('compromisos')

  const items = useMemo(() => {
    const out = []
    for (const s of sessions) {
      if (s.gameId !== 'mando-integro' || s.status !== 'completed') continue
      for (const c of s.commitments || []) {
        const p = s.participants.find((x) => x.id === c.participantId)
        if (!p) continue
        out.push({
          key: `${s.id}-${c.participantId}`,
          sessionId: s.id,
          sessionName: s.name,
          completedAt: s.completedAt,
          person: p,
          commitment: c,
          weakest: p.diagnostic?.weakest || c.dimension
        })
      }
    }
    return out.sort((a, b) => new Date(a.commitment.reviewDate || 0) - new Date(b.commitment.reviewDate || 0))
  }, [sessions])

  const today = new Date()
  const overdue = items.filter((i) => i.commitment.reviewDate && new Date(i.commitment.reviewDate) < today)
  const upcoming = items.filter((i) => !i.commitment.reviewDate || new Date(i.commitment.reviewDate) >= today)

  const byDimension = DIMENSIONS.map((d) => ({
    ...d,
    count: items.filter((i) => i.weakest === d.id).length
  }))
  const topGap = [...byDimension].sort((a, b) => b.count - a.count)[0]

  const unlockedPieces = items.reduce(
    (n, i) => n + microlearningPlan(i.weakest, i.completedAt).filter((m) => m.unlocked).length,
    0
  )

  return (
    <AppShell>
      <PageHeader
        eyebrow={<span className="section-title">Después de la sesión</span>}
        title="Refuerzo"
        description="Los compromisos que firmó cada líder y los microlearnings que les llegan por la app, enfocados en su dimensión más débil."
      />

      {items.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="Todavía no hay refuerzo activo"
          description="Cuando cierres una sesión de Mando Íntegro con compromisos, aparecerán aquí junto con su secuencia de microlearnings."
          action={
            <Link to="/app/juegos/mando-integro" className="btn-primary">
              Ir a Mando Íntegro
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Compromisos activos" value={items.length} Icon={IconTarget} color="#0ea5e9" />
            <StatCard
              label="Por revisar"
              value={overdue.length}
              Icon={IconClock}
              color="#e11d48"
              hint="Pasó la fecha que se pusieron"
            />
            <StatCard
              label="Microlearnings enviados"
              value={unlockedPieces}
              Icon={IconSparkles}
              color="#0d9488"
              hint="Piezas ya desbloqueadas"
            />
            <StatCard
              label="Brecha más común"
              value={topGap?.label}
              Icon={IconCheck}
              color={topGap?.color}
              hint={`${topGap?.count} líderes la tienen como más débil`}
            />
          </div>

          {/* Brecha por dimensión */}
          <div className="card mt-4 p-6">
            <SectionHeader title="Dónde está la brecha de liderazgo">
              Dimensión más débil de cada líder que pasó por una sesión.
            </SectionHeader>
            <div className="grid gap-3 sm:grid-cols-3">
              {byDimension.map((d) => (
                <div key={d.id} className="panel">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span
                        className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-bold text-white"
                        style={{ background: d.color }}
                      >
                        {d.label[0]}
                      </span>
                      {d.label}
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">{d.count}</span>
                  </div>
                  <ProgressBar
                    className="mt-2.5"
                    value={d.count}
                    max={Math.max(1, ...byDimension.map((x) => x.count))}
                    color={d.color}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { value: 'compromisos', label: `Compromisos (${items.length})` },
                { value: 'microlearnings', label: 'Microlearnings' }
              ]}
            />
          </div>

          {tab === 'compromisos' && (
            <div className="mt-4 space-y-3">
              {overdue.length > 0 && (
                <>
                  <h3 className="section-title">Vencidos · toca hacer seguimiento</h3>
                  {overdue.map((i) => (
                    <CommitmentRow key={i.key} item={i} overdue />
                  ))}
                </>
              )}
              {upcoming.length > 0 && (
                <>
                  <h3 className="section-title mt-6">Próximos</h3>
                  {upcoming.map((i) => (
                    <CommitmentRow key={i.key} item={i} />
                  ))}
                </>
              )}
            </div>
          )}

          {tab === 'microlearnings' && (
            <div className="mt-4 space-y-4">
              {items.map((i) => {
                const weak = DIMENSION_MAP[i.weakest]
                const plan = microlearningPlan(i.weakest, i.completedAt)
                const done = plan.filter((m) => m.unlocked).length
                return (
                  <div key={i.key} className="card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white"
                          style={{ background: weak?.color }}
                        >
                          {i.person.name[0]?.toUpperCase()}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{i.person.name}</div>
                          <div className="text-xs text-slate-400">{i.sessionName}</div>
                        </div>
                      </div>
                      <span className="chip" style={{ background: `${weak?.color}14`, color: weak?.color }}>
                        Refuerzo en {weak?.label} · {done}/{plan.length}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      {plan.map((m) => (
                        <div
                          key={m.week}
                          className={`rounded-lg border p-3 ${
                            m.unlocked ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/60 opacity-70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Semana {m.week} · {m.format}
                            </span>
                            {m.unlocked ? (
                              <span className="chip bg-teal-500/10 text-teal-700">Enviado</span>
                            ) : (
                              <span className="chip bg-slate-100 text-slate-400">
                                🔒 {new Date(m.unlocksAt).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 text-sm font-bold text-slate-800">{m.title}</div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">{m.body}</p>
                          <p className="mt-2 text-[11px] font-semibold" style={{ color: weak?.color }}>
                            → {m.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </AppShell>
  )
}

function CommitmentRow({ item, overdue }) {
  const d = DIMENSION_MAP[item.commitment.dimension]
  return (
    <div className={`card p-5 ${overdue ? 'border-coral-200' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900">{item.person.name}</span>
            {d && (
              <span className="chip" style={{ background: `${d.color}14`, color: d.color }}>
                {d.label}
              </span>
            )}
            <Link
              to={`/app/sesion/${item.sessionId}/reporte`}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              {item.sessionName}
            </Link>
          </div>
          <p className="mt-1.5 text-sm text-slate-600">{item.commitment.text || '—'}</p>
        </div>
        {item.commitment.reviewDate && (
          <span className={`chip shrink-0 ${overdue ? 'bg-coral-500/10 text-coral-600' : 'bg-slate-100 text-slate-500'}`}>
            <IconClock className="h-3 w-3" />
            {overdue ? 'Venció' : 'Revisa'}{' '}
            {new Date(item.commitment.reviewDate).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  )
}
