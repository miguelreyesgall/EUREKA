import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import Balanza from '../../components/Balanza'
import SenderoBoard from '../../components/SenderoBoard'
import { PageHeader, SectionHeader, StatCard, Tabs } from '../../components/ui'
import { IconCheck, IconClock, IconSparkles, IconTarget, IconUsers } from '../../components/icons'
import {
  CLOSING_GENERAL,
  DECK_MAP,
  DILEMMA_DECKS,
  DIMENSIONS,
  DIMENSION_MAP,
  LEARNING_MATRIX_BLOCKS,
  SUMMIT,
  computeMandoReport
} from '../../lib/mandoIntegro'
import { generateMandoInsights } from '../../lib/aiInsights'
import { microlearningPlan } from '../../lib/microlearnings'

export default function MandoReport({ session }) {
  const report = useMemo(() => computeMandoReport(session), [session])
  const [tab, setTab] = useState('grupal')

  const fmt = (d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })
  const equilibrado = report.ending === 'equilibrado'

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Analítica', to: '/app/analitica' }, { label: session.name }]}
        eyebrow={<span className="chip bg-sky-50 text-sky-700">Reporte · Mando Íntegro</span>}
        title={session.name}
        description={`${report.totalRounds} turnos · ${
          session.completedAt ? `cerrada el ${fmt(session.completedAt)}` : 'en curso'
        }`}
        actions={
          <button onClick={() => window.print()} className="btn-ghost btn-sm">
            Exportar / Imprimir
          </button>
        }
      />

      {/* Final */}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="card grid place-items-center p-6 text-center">
          <div className="section-title">Final del ascenso</div>
          <div className="mt-3 text-5xl">{equilibrado ? '⚖️' : '😮‍💨'}</div>
          <div className="mt-2 text-2xl font-extrabold capitalize text-slate-900">{report.ending}</div>
          <div className="mt-1 text-sm text-slate-500">
            Casilla {report.position} de {SUMMIT}
          </div>
        </div>
        <div className="card p-6">
          <SectionHeader title="Lectura de la partida" />
          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            {report.rounds.length === 0 ? (
              <p>Todavía no se jugaron turnos.</p>
            ) : (
              (report.narrative || []).map((p, i) => <p key={i}>{p}</p>)
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <StatCard label="Turnos jugados" value={report.totalRounds} Icon={IconClock} color="#0ea5e9" />
        <StatCard
          label="Con bonificación"
          value={report.bonusRounds}
          suffix={`/ ${report.totalRounds}`}
          Icon={IconCheck}
          color="#0d9488"
          hint="Turnos con la Balanza equilibrada"
        />
        <StatCard
          label="Dimensión dominante"
          value={DIMENSION_MAP[report.teamDominant]?.label}
          Icon={IconTarget}
          color={DIMENSION_MAP[report.teamDominant]?.color}
        />
        <StatCard
          label="Dimensión olvidada"
          value={DIMENSION_MAP[report.teamWeakest]?.label}
          Icon={IconUsers}
          color={DIMENSION_MAP[report.teamWeakest]?.color}
        />
      </div>

      <MandoAIPanel session={session} report={report} />

      <div className="mt-8">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'grupal', label: 'Vista grupal' },
            { value: 'individual', label: 'Vista individual' },
            { value: 'refuerzo', label: 'Refuerzo' }
          ]}
        />
      </div>

      {tab === 'grupal' && <GroupView report={report} />}
      {tab === 'individual' && <IndividualView report={report} />}
      {tab === 'refuerzo' && <ReinforcementView report={report} session={session} />}

      <p className="mt-6 text-center text-xs text-slate-400">
        Reporte generado automáticamente por Eureka a partir de {report.totalRounds} turnos. Demo · datos locales.
      </p>
    </>
  )
}

/* ------------------------------------------------------------- IA */

function MandoAIPanel({ session, report }) {
  const insights = useMemo(() => generateMandoInsights(session, report), [session, report])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const t = setTimeout(() => setReady(true), 1100)
    return () => clearTimeout(t)
  }, [session.id])

  return (
    <div className="card mt-6 overflow-hidden border-sky-200/60">
      <div className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden bg-gradient-to-r from-sky-800 via-sky-600 to-blue-500 px-6 py-4 text-white">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <IconSparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-extrabold tracking-tight">Análisis generado por IA</div>
            <div className="text-[11px] text-sky-100">Eureka AI · lectura del patrón de liderazgo del grupo</div>
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
          <div>
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
              <p className="text-sm font-medium text-slate-500">Eureka AI está leyendo las decisiones del grupo…</p>
            </div>
            <div className="space-y-2">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-[90%]" />
              <div className="skeleton h-3 w-[75%]" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 w-full" />
              ))}
            </div>
          </div>
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

            <div className="mt-6 rounded-xl border border-slate-100 p-4">
              <h3 className="section-title">Reparto de decisiones vs. liderazgo equilibrado</h3>
              <div className="mt-2 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={insights.radar} outerRadius="72%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#475569' }} />
                    <PolarRadiusAxis domain={[0, 70]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Radar name="Este grupo" dataKey="equipo" stroke="#0284c7" fill="#0284c7" fillOpacity={0.35} />
                    <Radar
                      name="Equilibrado"
                      dataKey="balanceIdeal"
                      stroke="#14b8a6"
                      fill="#14b8a6"
                      fillOpacity={0.12}
                      strokeDasharray="4 3"
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-sky-50/70 p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Recomendaciones de la IA</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {insights.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-sky-500">✓</span>
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

/* -------------------------------------------------------- Vista grupal */

function GroupView({ report }) {
  const choiceData = DIMENSIONS.map((d) => ({
    name: d.label,
    Decisiones: report.choiceTotals[d.id] || 0,
    color: d.color
  }))

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <Balanza balance={report.balance} />
        </div>
        <div className="card p-6">
          <SenderoBoard position={report.position} />
        </div>
      </div>

      <div className="card p-6">
        <SectionHeader title="Decisiones por dimensión">
          Cómo se repartieron las {report.totalRounds} decisiones del grupo.
        </SectionHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={choiceData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="Decisiones" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {choiceData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Turno a turno */}
      <div className="card p-6">
        <SectionHeader title="Turno a turno" />
        <div className="space-y-2">
          {report.rounds.map((r, i) => {
            const d = DIMENSION_MAP[r.choice]
            const deck = DECK_MAP[r.deckId]
            return (
              <div key={i} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-base">
                    {deck?.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-700">
                      {i + 1}. {r.leaderName}
                    </div>
                    <div className="truncate text-[11px] text-slate-400">{deck?.label}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="chip" style={{ background: `${d.color}14`, color: d.color }}>
                    {d.label}
                  </span>
                  <span
                    className={`chip ${r.balanced ? 'bg-teal-500/10 text-teal-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {r.balanced ? '+2 casillas' : '+1 casilla'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Debrief */}
      {Object.keys(report.closingAnswers || {}).length > 0 && (
        <div className="card p-6">
          <SectionHeader title="Debrief del grupo" />
          <div className="grid gap-3 md:grid-cols-2">
            {DILEMMA_DECKS.map((d) =>
              report.closingAnswers[d.id] ? (
                <div key={d.id} className="panel">
                  <div className="text-xs font-semibold text-slate-500">{d.closing}</div>
                  <p className="mt-1.5 text-sm text-slate-700">{report.closingAnswers[d.id]}</p>
                </div>
              ) : null
            )}
            {report.closingAnswers.general && (
              <div className="panel border-brand-200 bg-brand-50/40 md:col-span-2">
                <div className="text-xs font-semibold text-slate-500">{CLOSING_GENERAL}</div>
                <p className="mt-1.5 text-sm text-slate-700">{report.closingAnswers.general}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------- Vista individual */

function IndividualView({ report }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="card p-6">
        <SectionHeader title="Diagnóstico vs. decisiones reales">
          El hallazgo central del juego: desde dónde cree cada líder que lidera, y desde dónde decidió cuando le tocó.
        </SectionHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {report.leaders.map((l) => {
            const dom = l.dominant ? DIMENSION_MAP[l.dominant] : null
            const used = l.mostUsed ? DIMENSION_MAP[l.mostUsed] : null
            const weak = l.weakest ? DIMENSION_MAP[l.weakest] : null
            return (
              <div key={l.id} className="panel">
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ background: dom?.color || '#94a3b8' }}
                  >
                    {l.name?.[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-slate-800">{l.name}</div>
                    <div className="truncate text-xs text-slate-400">{l.role}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 rounded-lg bg-white p-2 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Diagnóstico</div>
                    <div className="text-xs font-extrabold" style={{ color: dom?.color }}>
                      {dom?.label || '—'}
                    </div>
                  </div>
                  <span className="text-slate-300">→</span>
                  <div className="flex-1 rounded-lg bg-white p-2 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">En el juego</div>
                    <div className="text-xs font-extrabold" style={{ color: used?.color }}>
                      {used?.label || '—'}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="chip bg-slate-100 text-slate-500">{l.turnsLed} turnos</span>
                  {weak && (
                    <span className="chip" style={{ background: `${weak.color}14`, color: weak.color }}>
                      A reforzar: {weak.label}
                    </span>
                  )}
                  {l.matchedDiagnostic !== null && (
                    <span
                      className={`chip ${
                        l.matchedDiagnostic ? 'bg-teal-500/10 text-teal-700' : 'bg-amber-400/15 text-amber-600'
                      }`}
                    >
                      {l.matchedDiagnostic ? 'Coherente' : 'Decidió distinto'}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Matriz de aprendizaje */}
      {Object.keys(report.learningMatrix || {}).length > 0 && (
        <div className="card p-6">
          <SectionHeader title="Matriz de aprendizaje" />
          <div className="space-y-4">
            {report.leaders.map((l) => {
              const m = report.learningMatrix[l.id]
              if (!m) return null
              return (
                <div key={l.id}>
                  <h3 className="text-sm font-extrabold text-slate-900">{l.name}</h3>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    {LEARNING_MATRIX_BLOCKS.map((b) =>
                      m[b.id] ? (
                        <div key={b.id} className="panel">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {b.label}
                          </div>
                          <p className="mt-1 text-sm text-slate-700">{m[b.id]}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------ Refuerzo */

function ReinforcementView({ report, session }) {
  return (
    <div className="mt-4 space-y-4">
      <div className="card p-6">
        <SectionHeader title="Compromisos de la semana">
          Una acción concreta por líder, con fecha de revisión.
        </SectionHeader>
        {report.commitments.length === 0 ? (
          <p className="text-sm text-slate-400">No se registraron compromisos en el cierre.</p>
        ) : (
          <div className="space-y-2.5">
            {report.commitments.map((c, i) => {
              const p = report.leaders.find((l) => l.id === c.participantId)
              const d = DIMENSION_MAP[c.dimension]
              const overdue = c.reviewDate && new Date(c.reviewDate) < new Date()
              return (
                <div key={i} className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{p?.name || 'Participante'}</span>
                      {d && (
                        <span className="chip" style={{ background: `${d.color}14`, color: d.color }}>
                          {d.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{c.text || '—'}</p>
                  </div>
                  {c.reviewDate && (
                    <span className={`chip shrink-0 ${overdue ? 'bg-coral-500/10 text-coral-600' : 'bg-white text-slate-500'}`}>
                      <IconClock className="h-3 w-3" />
                      Revisa {new Date(c.reviewDate).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card p-6">
        <SectionHeader title="Microlearnings asignados">
          Cada líder recibe la secuencia de su dimensión más débil, una pieza por semana.
        </SectionHeader>
        <div className="space-y-4">
          {report.leaders.map((l) => {
            const weak = l.weakest ? DIMENSION_MAP[l.weakest] : null
            if (!weak) return null
            const plan = microlearningPlan(l.weakest, session.completedAt)
            return (
              <div key={l.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900">{l.name}</span>
                  <span className="chip" style={{ background: `${weak.color}14`, color: weak.color }}>
                    Refuerzo en {weak.label}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {plan.map((m) => (
                    <div
                      key={m.week}
                      className={`rounded-lg border p-3 ${m.unlocked ? 'border-slate-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50/60 opacity-70'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Semana {m.week} · {m.format}
                        </span>
                        {m.unlocked ? (
                          <span className="chip bg-teal-500/10 text-teal-700">Disponible</span>
                        ) : (
                          <span className="chip bg-slate-100 text-slate-400">🔒</span>
                        )}
                      </div>
                      <div className="mt-1.5 text-sm font-bold text-slate-800">{m.title}</div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{m.body}</p>
                      <p className="mt-2 text-[11px] font-semibold" style={{ color: weak.color }}>
                        → {m.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
