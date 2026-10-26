import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { EmptyState, PageHeader, ProgressBar, StatCard } from '../components/ui'
import { IconChevronDown, IconSearch, IconTarget, IconUsers } from '../components/icons'
import { useCompanySessions } from '../lib/store'
import { aggregatePeople } from '../lib/people'
import { DISC_STYLES, STYLE_MAP } from '../lib/discGame'
import { DIMENSION_MAP } from '../lib/diagnostic'

export default function People() {
  const sessions = useCompanySessions()
  const allPeople = useMemo(() => aggregatePeople(sessions), [sessions])
  const [query, setQuery] = useState('')
  const [styleFilter, setStyleFilter] = useState('all')
  const [openName, setOpenName] = useState(null)

  const people = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allPeople
      .filter((p) => (styleFilter === 'all' ? true : p.style === styleFilter))
      .filter((p) => (q ? `${p.name} ${p.role || ''}`.toLowerCase().includes(q) : true))
  }, [allPeople, query, styleFilter])

  const uniqueStyles = new Set(allPeople.map((p) => p.style).filter(Boolean)).size
  const totalSuccessful = allPeople.reduce((n, p) => n + p.totalSuccessful, 0)
  const fmt = (d) => (d ? new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

  return (
    <AppShell>
      <PageHeader
        title="Personas"
        description="Directorio de quienes han participado en alguna dinámica, con su ficha DISC y su historial."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Personas registradas" value={allPeople.length} Icon={IconUsers} color="#4f46e5" />
        <StatCard label="Estilos DISC presentes" value={uniqueStyles} suffix="/ 4" Icon={IconTarget} color="#0d9488" />
        <StatCard label="Fichas exitosas" value={totalSuccessful} emoji="🎯" color="#e11d48" hint="Suma de participaciones ganadoras" />
      </div>

      {/* Controles */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Buscar persona o rol…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          <FilterPill active={styleFilter === 'all'} onClick={() => setStyleFilter('all')}>
            Todos
          </FilterPill>
          {DISC_STYLES.map((s) => (
            <FilterPill key={s.id} active={styleFilter === s.id} onClick={() => setStyleFilter(s.id)} color={s.color}>
              {s.id}
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {people.length === 0 ? (
          <EmptyState
            emoji="👥"
            title={allPeople.length === 0 ? 'Aún no hay personas' : 'Sin resultados'}
            description={
              allPeople.length === 0
                ? 'Crea una sesión con equipos y las personas aparecerán aquí automáticamente.'
                : 'Ajusta la búsqueda o el filtro de estilo.'
            }
            action={
              allPeople.length === 0 && (
                <Link to="/app/juegos/codigo-disc/nueva" className="btn-primary">
                  Crear sesión
                </Link>
              )
            }
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="hidden grid-cols-[1.8fr_1fr_0.7fr_0.9fr_0.9fr_auto] gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid">
              <span>Persona</span>
              <span>Rol frecuente</span>
              <span>Sesiones</span>
              <span>Efectividad</span>
              <span>Última vez</span>
              <span />
            </div>
            <div className="divide-y divide-slate-100">
              {people.map((p) => {
                const style = p.style ? STYLE_MAP[p.style] : null
                const dim = p.dimension ? DIMENSION_MAP[p.dimension] : null
                const badge = style
                  ? { color: style.color, letter: style.id, label: style.label }
                  : dim
                    ? { color: dim.color, letter: dim.label[0], label: dim.label }
                    : null
                const open = openName === p.name
                const rate = p.totalContributed ? Math.round((p.totalSuccessful / p.totalContributed) * 100) : 0
                return (
                  <div key={p.name}>
                    <button
                      onClick={() => setOpenName(open ? null : p.name)}
                      className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-5 py-3.5 text-left text-sm transition hover:bg-slate-50/70 md:grid-cols-[1.8fr_1fr_0.7fr_0.9fr_0.9fr_auto]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                          style={{ background: badge?.color || '#94a3b8' }}
                          title={badge?.label || 'Sin perfil'}
                        >
                          {badge?.letter || '?'}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-800">{p.name}</span>
                          <span className="block truncate text-xs text-slate-400 md:hidden">
                            {p.role} · {p.sessionsCount} sesiones
                          </span>
                        </span>
                      </span>
                      <span className="hidden truncate text-slate-500 md:block">{p.role || '—'}</span>
                      <span className="hidden text-slate-500 md:block">{p.sessionsCount}</span>
                      <span className="hidden md:block">
                        <span className="text-xs font-semibold text-slate-600">{rate}%</span>
                        <ProgressBar className="mt-1" value={rate} max={100} color={badge?.color} />
                      </span>
                      <span className="hidden text-xs text-slate-400 md:block">{fmt(p.lastPlayed)}</span>
                      <IconChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {open && (
                      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                        <h4 className="section-title">Historial de sesiones</h4>
                        <div className="mt-2.5 space-y-2">
                          {p.sessions.map((s, i) => (
                            <div
                              key={i}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white p-3 text-xs"
                            >
                              <div className="min-w-0">
                                <Link
                                  to={s.status === 'completed' ? `/app/sesion/${s.sessionId}/reporte` : `/app/sesion/${s.sessionId}`}
                                  className="font-semibold text-slate-700 hover:text-brand-600"
                                >
                                  {s.sessionName}
                                </Link>
                                <span className="text-slate-400"> · {s.teamName}</span>
                              </div>
                              <div className="flex items-center gap-3 text-slate-500">
                                <span>{fmt(s.date)}</span>
                                {s.status === 'completed' ? (
                                  <span className="chip bg-teal-500/10 text-teal-700">
                                    {s.successfulCount ?? 0} fichas exitosas
                                  </span>
                                ) : (
                                  <span className="chip bg-slate-100 text-slate-500">
                                    {s.status === 'draft' ? 'Borrador' : 'En juego'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function FilterPill({ active, onClick, color, children }) {
  return (
    <button
      onClick={onClick}
      className={`min-w-[38px] rounded-lg px-3 py-1.5 text-xs font-bold transition ${
        active ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
      style={active && color ? { color } : undefined}
    >
      {children}
    </button>
  )
}
