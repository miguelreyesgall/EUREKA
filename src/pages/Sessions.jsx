import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import { EmptyState, PageHeader, ProgressBar } from '../components/ui'
import { IconPlay, IconPlus, IconSearch, IconTrophy } from '../components/icons'
import { useCompanySessions } from '../lib/store'
import { GAME_MAP } from '../lib/games'
import { sessionComposition, sessionPeople } from '../lib/sessions'
import { DECKS } from '../lib/discGame'

const FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'draft', label: 'Borradores' },
  { value: 'in_progress', label: 'En juego' },
  { value: 'completed', label: 'Completadas' }
]

export default function Sessions() {
  const sessions = useCompanySessions()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const counts = useMemo(
    () => ({
      all: sessions.length,
      draft: sessions.filter((s) => s.status === 'draft').length,
      in_progress: sessions.filter((s) => s.status === 'in_progress').length,
      completed: sessions.filter((s) => s.status === 'completed').length
    }),
    [sessions]
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sessions
      .filter((s) => (filter === 'all' ? true : s.status === filter))
      .filter((s) => (q ? `${s.name} ${s.purpose || ''}`.toLowerCase().includes(q) : true))
  }, [sessions, filter, query])

  const fmt = (d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <AppShell>
      <PageHeader
        title="Sesiones"
        description="Todas las dinámicas creadas por tu empresa, en cualquier estado."
        actions={
          <Link to="/app/juegos/codigo-disc/nueva" className="btn-primary">
            <IconPlus className="h-4 w-4" />
            Nueva sesión
          </Link>
        }
      />

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Buscar por nombre u objetivo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${filter === f.value ? 'text-brand-400' : 'text-slate-400'}`}>
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="mt-5 space-y-3">
        {visible.length === 0 ? (
          <EmptyState
            emoji="🗂️"
            title={sessions.length === 0 ? 'Aún no hay sesiones' : 'Sin resultados'}
            description={
              sessions.length === 0
                ? 'Crea tu primera dinámica desde el marketplace de juegos.'
                : 'Prueba con otro término de búsqueda o cambia el filtro.'
            }
            action={
              sessions.length === 0 && (
                <Link to="/app/juegos" className="btn-primary">
                  Ir al marketplace
                </Link>
              )
            }
          />
        ) : (
          visible.map((s) => {
            const game = GAME_MAP[s.gameId]
            const placed = (s.rounds || []).filter((r) => r.placed).length
            const deckIndex = Math.min(s.currentDeckIndex ?? 0, DECKS.length)

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
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="truncate text-base font-bold text-slate-900">{s.name}</h3>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                        {s.purpose || 'Sin objetivo definido'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>{game?.name}</span>
                        <span className="text-slate-300">·</span>
                        <span>{sessionComposition(s)}</span>
                        <span className="text-slate-300">·</span>
                        <span>{fmt(s.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {s.status === 'completed' ? (
                      <button
                        onClick={() => navigate(`/app/sesion/${s.id}/reporte`)}
                        className="btn-teal btn-sm"
                      >
                        <IconTrophy className="h-3.5 w-3.5" />
                        Ver reporte
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/app/sesion/${s.id}`)} className="btn-primary btn-sm">
                        <IconPlay className="h-3 w-3" />
                        {s.status === 'draft' ? 'Abrir sala' : 'Continuar'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progreso */}
                {s.status !== 'draft' && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>
                        {s.status === 'completed'
                          ? `${placed} fichas colocadas en total`
                          : `Mazo ${Math.min(deckIndex + 1, DECKS.length)} de ${DECKS.length} · ${DECKS[Math.min(deckIndex, DECKS.length - 1)]?.label}`}
                      </span>
                      <span>{Math.round((deckIndex / DECKS.length) * 100)}%</span>
                    </div>
                    <ProgressBar value={deckIndex} max={DECKS.length} />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </AppShell>
  )
}
