import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import { EmptyState, PageHeader, ProgressBar, SectionHeader, StatCard } from '../components/ui'
import { IconChart, IconGrid, IconPlay, IconPlus, IconTarget, IconUsers } from '../components/icons'
import { actions, useCompanySessions, useCurrentCompany } from '../lib/store'
import { GAMES, GAME_MAP } from '../lib/games'
import { sessionComposition, sessionPeople } from '../lib/sessions'
import { DECKS, DISC_STYLES } from '../lib/discGame'
import { aggregatePeople } from '../lib/people'
import { toast } from '../lib/toast'

export default function Dashboard() {
  const company = useCurrentCompany()
  const sessions = useCompanySessions()
  const navigate = useNavigate()

  const people = useMemo(() => aggregatePeople(sessions), [sessions])
  const completed = sessions.filter((s) => s.status === 'completed')
  const totalPlaced = sessions.reduce((n, s) => n + (s.rounds || []).filter((r) => r.placed).length, 0)
  const totalRounds = sessions.reduce((n, s) => n + (s.rounds || []).length, 0)
  const successRate = totalRounds ? Math.round((totalPlaced / totalRounds) * 100) : 0

  const styleData = useMemo(() => {
    const counts = Object.fromEntries(DISC_STYLES.map((s) => [s.id, 0]))
    for (const p of people) if (p.style) counts[p.style] += 1
    return DISC_STYLES.map((s) => ({ name: s.label, value: counts[s.id], color: s.color }))
  }, [people])
  const hasStyleData = styleData.some((d) => d.value > 0)

  const nextSession = sessions.find((s) => s.status === 'in_progress') || sessions.find((s) => s.status === 'draft')
  const fmt = (d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <AppShell>
      <PageHeader
        eyebrow={<span className="section-title">Bienvenido de nuevo</span>}
        title={company?.name || 'Panel'}
        description="Resumen del uso de Eureka en toda tu cuenta."
        actions={
          <>
            <button
              onClick={() => {
                if (confirm('Esto reemplaza los datos actuales por la empresa de ejemplo. ¿Continuar?')) {
                  actions.loadDemoData()
                  toast.success('Datos de ejemplo cargados')
                }
              }}
              className="btn-ghost btn-sm"
            >
              Cargar datos de ejemplo
            </button>
            <Link to="/app/juegos/codigo-disc/nueva" className="btn-primary btn-sm">
              <IconPlus className="h-3.5 w-3.5" />
              Nueva sesión
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Personas" value={people.length} Icon={IconUsers} color="#4f46e5" hint="Han jugado al menos una dinámica" />
        <StatCard label="Sesiones" value={sessions.length} Icon={IconGrid} color="#0d9488" hint={`${completed.length} completadas`} />
        <StatCard label="Fichas colocadas" value={totalPlaced} suffix={totalRounds ? `/ ${totalRounds}` : ''} Icon={IconTarget} color="#e11d48" />
        <StatCard label="Efectividad" value={`${successRate}%`} Icon={IconChart} color="#f59e0b" hint="Rondas resueltas con 3+ estilos" />
      </div>

      {/* Distribucion + continuar */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <SectionHeader title="Distribución de estilos DISC">
            Cómo se reparten las fichas de identidad entre las personas de tu empresa.
          </SectionHeader>
          {hasStyleData ? (
            <div className="grid items-center gap-4 sm:grid-cols-[200px_1fr]">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={styleData} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={3} stroke="none">
                      {styleData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5">
                {styleData.map((d, i) => {
                  const total = styleData.reduce((n, x) => n + x.value, 0) || 1
                  return (
                    <div key={d.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 font-medium text-slate-600">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                          {DISC_STYLES[i].id} · {d.name}
                        </span>
                        <span className="font-semibold text-slate-500">
                          {d.value} <span className="text-slate-300">({Math.round((d.value / total) * 100)}%)</span>
                        </span>
                      </div>
                      <ProgressBar className="mt-1.5" value={d.value} max={total} color={d.color} />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">
              Sin datos todavía. Crea una sesión con equipos para ver la distribución.
            </p>
          )}
        </div>

        <div className="card flex flex-col p-6">
          <SectionHeader title={nextSession ? 'Continúa donde quedaste' : 'Empieza aquí'} />
          {nextSession ? (
            <>
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                  style={{ background: `${GAME_MAP[nextSession.gameId]?.color || '#64748b'}14` }}
                >
                  {GAME_MAP[nextSession.gameId]?.icon || '🎲'}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-800">{nextSession.name}</div>
                  <StatusBadge status={nextSession.status} />
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>
                    {nextSession.status === 'draft'
                      ? 'Sin iniciar'
                      : `Mazo ${Math.min((nextSession.currentDeckIndex ?? 0) + 1, DECKS.length)} de ${DECKS.length}`}
                  </span>
                  <span>{Math.round(((nextSession.currentDeckIndex ?? 0) / DECKS.length) * 100)}%</span>
                </div>
                <ProgressBar value={nextSession.currentDeckIndex ?? 0} max={DECKS.length} />
              </div>
              <button
                onClick={() => navigate(`/app/sesion/${nextSession.id}`)}
                className="btn-primary mt-5 w-full"
              >
                <IconPlay className="h-3.5 w-3.5" />
                {nextSession.status === 'draft' ? 'Abrir sala' : 'Continuar dinámica'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                Crea una sesión de Código DISC, arma los equipos y guía la dinámica desde la consola.
              </p>
              <Link to="/app/juegos/codigo-disc/nueva" className="btn-primary mt-auto w-full">
                <IconPlus className="h-4 w-4" />
                Crear sesión
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Uso por juego */}
      <div className="mt-9">
        <SectionHeader title="Uso por juego" action="Ver marketplace" actionTo="/app/juegos" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GAMES.map((g) => {
            const gSessions = sessions.filter((s) => s.gameId === g.id)
            return (
              <Link key={g.id} to={`/app/juegos/${g.id}`} className="card card-hover p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                    style={{ background: `${g.color}14` }}
                  >
                    {g.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-slate-800">{g.name}</div>
                    <div className="truncate text-[11px] text-slate-400">{g.category}</div>
                  </div>
                </div>
                <div className="mt-3.5 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {g.status === 'available' ? `${gSessions.length} sesiones` : 'Sin sesiones'}
                  </span>
                  {g.status === 'available' ? (
                    <span className="chip bg-teal-500/10 text-teal-700">Disponible</span>
                  ) : (
                    <span className="chip bg-slate-100 text-slate-500">Pronto</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="mt-9">
        <SectionHeader title="Actividad reciente" action="Ver todas" actionTo="/app/sesiones" />
        {sessions.length === 0 ? (
          <EmptyState
            emoji="🎲"
            title="Aún no hay sesiones"
            description="Crea tu primera dinámica desde el marketplace o carga la empresa de ejemplo."
            action={
              <Link to="/app/juegos" className="btn-primary">
                Ir al marketplace
              </Link>
            }
          />
        ) : (
          <div className="card divide-y divide-slate-100">
            {sessions.slice(0, 5).map((s) => {
              const game = GAME_MAP[s.gameId]
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-slate-50/70">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base" style={{ background: `${game?.color || '#64748b'}14` }}>
                      {game?.icon || '🎲'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-800">{s.name}</span>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {game?.name} · {sessionComposition(s)} · {fmt(s.createdAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(s.status === 'completed' ? `/app/sesion/${s.id}/reporte` : `/app/sesion/${s.id}`)}
                    className={`btn-sm shrink-0 ${s.status === 'completed' ? 'btn-ghost' : 'btn-primary'}`}
                  >
                    {s.status === 'completed' ? 'Ver reporte' : s.status === 'draft' ? 'Abrir sala' : 'Continuar'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
