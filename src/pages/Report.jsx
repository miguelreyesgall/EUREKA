import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AppShell from '../components/AppShell'
import DiscBoard from '../components/DiscBoard'
import AIInsightsPanel from '../components/AIInsightsPanel'
import { EmptyState, PageHeader, SectionHeader, Tabs } from '../components/ui'
import { IconTrophy } from '../components/icons'
import { useSession } from '../lib/store'
import MandoReport from './mando/MandoReport'
import { computeDiscReport, DECKS, DISC_STYLES, MIN_STYLES_TO_PLACE } from '../lib/discGame'
import { longestStreak, teamBadges, teamPoints } from '../lib/achievements'

export default function Report() {
  const { id } = useParams()
  const session = useSession(id)
  const isMando = session?.gameId === 'mando-integro'
  // Mando Íntegro tiene su propio motor de reporte: no pasar por el de DISC.
  const report = useMemo(() => (session && !isMando ? computeDiscReport(session) : null), [session, isMando])
  const [tab, setTab] = useState('grupal')

  if (!session) {
    return (
      <AppShell>
        <EmptyState emoji="🔍" title="Reporte no encontrado" description="La sesión que buscas no existe." />
      </AppShell>
    )
  }

  if (isMando) {
    return (
      <AppShell>
        <MandoReport session={session} />
      </AppShell>
    )
  }

  if (!report) {
    return (
      <AppShell>
        <EmptyState emoji="🔍" title="Reporte no disponible" description="No se pudo generar el reporte." />
      </AppShell>
    )
  }

  const fmt = (d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <AppShell>
      <PageHeader
        breadcrumbs={[{ label: 'Analítica', to: '/app/analitica' }, { label: session.name }]}
        eyebrow={<span className="chip bg-brand-50 text-brand-700">Reporte · Código DISC</span>}
        title={session.name}
        description={`${report.totalPlaced} de ${report.totalRounds} fichas colocadas · ${
          session.completedAt ? `cerrada el ${fmt(session.completedAt)}` : 'en curso'
        }`}
        actions={
          <button onClick={() => window.print()} className="btn-ghost btn-sm">
            Exportar / Imprimir
          </button>
        }
      />

      {/* Ganador + narrativa */}
      <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
        <div className="card grid place-items-center overflow-hidden p-6 text-center">
          <div className="section-title">Equipo ganador</div>
          <div className="mt-4 grid h-16 w-16 place-items-center rounded-2xl bg-amber-400/15 text-amber-500">
            <IconTrophy className="h-8 w-8" />
          </div>
          <div className="mt-3 text-lg font-extrabold text-slate-900">
            {report.winners.length ? report.winners.map((w) => w.name).join(' y ') : 'Sin ganador'}
          </div>
          {report.winners.length > 0 && (
            <div className="mt-0.5 text-sm text-slate-500">{report.winners[0].points} fichas colocadas</div>
          )}
        </div>
        <div className="card p-6">
          <SectionHeader title="Lectura de la dinámica" />
          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            {report.narrative.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      <AIInsightsPanel session={session} report={report} />

      <div className="mt-8">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'grupal', label: 'Vista grupal' },
            { value: 'individual', label: 'Vista individual' }
          ]}
        />
      </div>

      {tab === 'grupal' ? <GroupView report={report} /> : <IndividualView report={report} />}

      {/* Matriz de aprendizaje */}
      {report.learningMatrix.length > 0 && (
        <div className="card mt-4 p-6">
          <SectionHeader title="Matriz de aprendizaje">Cierre en plenaria después de los 6 mazos.</SectionHeader>
          <div className="grid gap-3 md:grid-cols-2">
            {report.learningMatrix.map((m) => (
              <div key={m.deckId} className="panel">
                <div className="text-xs font-semibold text-slate-500">{m.question}</div>
                <p className="mt-1.5 text-sm text-slate-700">{m.answer || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        Reporte generado automáticamente por Eureka a partir de {report.totalRounds} rondas jugadas. Demo · datos
        locales.
      </p>
    </AppShell>
  )
}

function GroupView({ report }) {
  const teamChartData = report.teamStats.map((t) => ({ name: t.name, Fichas: t.points }))
  const styleChartData = DISC_STYLES.map((s) => ({
    name: s.label,
    Participación: report.styleParticipation[s.id] || 0,
    color: s.color
  }))

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="section-title">Fichas colocadas por equipo</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamChartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} domain={[0, 6]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="Fichas" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="section-title">
            Participación por estilo en soluciones ganadoras
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={styleChartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="Participación" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {styleChartData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {report.teamStats.map((t, i) => {
          const teamRounds = report.roundDetails.filter((r) => r.teamId === t.id)
          const badges = teamBadges(t, teamRounds)
          const points = teamPoints(t, teamRounds)
          const streak = longestStreak(teamRounds)
          return (
            <div key={t.id} className={`card p-6 ${i === 0 ? 'border-amber-300' : ''}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {i === 0 && <IconTrophy className="h-4 w-4 shrink-0 text-amber-500" />}
                  <h3 className="truncate text-base font-extrabold text-slate-900">{t.name}</h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {streak >= 2 && <span className="chip bg-coral-500/10 text-coral-600">🔥 x{streak}</span>}
                  <span className="tabular text-base font-extrabold text-slate-900">
                    {points}
                    <span className="ml-1 text-[10px] font-bold uppercase text-slate-400">pts</span>
                  </span>
                </div>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {t.points}/{t.roundsPlayed} fichas colocadas
              </div>

              <div className="mt-4 flex justify-center">
                <DiscBoard team={t} rounds={teamRounds} selectable={false} size="sm" />
              </div>

              {badges.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="section-title mb-2">Logros</div>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((b) => (
                      <span
                        key={b.id}
                        title={b.desc}
                        className="chip border border-amber-200 bg-amber-400/10 text-amber-700"
                      >
                        <span>{b.icon}</span> {b.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!t.canEverPlace && (
                <p className="mt-3 text-center text-xs text-amber-600">
                  ⚠️ No tiene los {MIN_STYLES_TO_PLACE} estilos mínimos representados en su plantilla.
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="card p-6">
        <h2 className="section-title">Ronda a ronda</h2>
        <div className="mt-4 space-y-4">
          {DECKS.map((deck, idx) => {
            const rows = report.roundDetails.filter((r) => r.deckId === deck.id)
            if (!rows.length) return null
            return (
              <div key={deck.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-base">
                    {deck.icon}
                  </span>
                  {idx < DECKS.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
                </div>
                <div className="min-w-0 flex-1 pb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-800">{deck.label}</span>
                    <span className="text-[11px] font-semibold text-slate-400">Mazo {idx + 1}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs italic text-slate-500">“{rows[0].cardText}”</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rows.map((r, i) => (
                      <span
                        key={i}
                        className={`chip ${r.placed ? 'bg-teal-500/10 text-teal-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {r.placed ? '🎯' : '⛔'} {r.teamName} · {r.styles.length} estilos
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function IndividualView({ report }) {
  return (
    <div className="card mt-4 p-6">
      <h2 className="section-title">Mirada por jugador</h2>
      <p className="mt-1 text-xs text-slate-400">
        Cuántas rondas participó cada persona visiblemente y cuántas de ellas terminaron en ficha colocada.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {report.people.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center gap-2">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                style={{ background: p.style?.color || '#94a3b8' }}
              >
                {p.style?.id || '?'}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{p.name}</div>
                <div className="truncate text-xs text-slate-400">{p.role} · {p.teamName}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rondas participadas</span>
                <span className="font-semibold text-slate-700">{p.contributedCount} / 6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Con ficha colocada</span>
                <span className="font-semibold text-slate-700">{p.successfulCount}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${p.contributedCount ? Math.round((p.successfulCount / p.contributedCount) * 100) : 0}%`,
                    background: p.style?.color || '#94a3b8'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
