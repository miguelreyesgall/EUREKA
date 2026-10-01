import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import DiscBoard from '../components/DiscBoard'
import { EmptyState, PageHeader, ProgressBar, SectionHeader } from '../components/ui'
import { IconClock, IconLayers, IconPlus, IconUsers } from '../components/icons'
import { GAME_MAP } from '../lib/games'
import { DECKS, DISC_STYLES, MIN_STYLES_TO_PLACE, ROUND_MINUTES } from '../lib/discGame'
import { useCompanySessions } from '../lib/store'

const DEMO_BOARD_TEAM = {
  id: 'demo',
  participants: [
    { id: 'd1', name: 'Ana Dominante', style: 'D' },
    { id: 'd2', name: 'Bruno Influyente', style: 'I' },
    { id: 'd3', name: 'Carla Estable', style: 'S' },
    { id: 'd4', name: 'Diego Cauteloso', style: 'C' }
  ]
}

export default function GameDetail() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const game = GAME_MAP[gameId]
  const sessions = useCompanySessions().filter((s) => s.gameId === gameId)

  if (!game) {
    return (
      <AppShell>
        <EmptyState
          emoji="🔍"
          title="Juego no encontrado"
          description="El juego que buscas no existe en el catálogo."
          action={
            <Link to="/app/juegos" className="btn-primary">
              Volver al marketplace
            </Link>
          }
        />
      </AppShell>
    )
  }

  const live = game.status === 'available'
  const fmt = (d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <AppShell>
      <PageHeader
        breadcrumbs={[{ label: 'Juegos', to: '/app/juegos' }, { label: game.name }]}
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: game.color }}>
              {game.category}
            </span>
            {live ? (
              <span className="chip bg-teal-500/10 text-teal-700">● Disponible</span>
            ) : (
              <span className="chip bg-slate-100 text-slate-500">Próximamente</span>
            )}
          </div>
        }
        title={
          <span className="flex items-center gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-2xl"
              style={{ background: `${game.color}1a` }}
            >
              {game.icon}
            </span>
            {game.name}
          </span>
        }
        description={game.description}
        actions={
          live && (
            <button onClick={() => navigate(`/app/juegos/${gameId}/nueva`)} className="btn-primary">
              <IconPlus className="h-4 w-4" />
              Crear sesión
            </button>
          )
        }
      />

      {!live ? (
        <EmptyState
          emoji="🔒"
          title="Muy pronto en tu cuenta"
          description="Este juego todavía no está habilitado para jugarse. Mientras tanto puedes explorar Punto de Encuentro, la dinámica activa de tu cuenta."
          action={
            <Link to="/app/juegos/punto-de-encuentro" className="btn-primary">
              Ir a Punto de Encuentro
            </Link>
          }
        />
      ) : (
        <>
          {/* Tablero */}
          <div className="card grid gap-8 p-6 md:grid-cols-[auto_1fr] md:items-center md:p-8">
            <div className="flex justify-center">
              <DiscBoard team={DEMO_BOARD_TEAM} rounds={[]} selectable={false} size="lg" />
            </div>
            <div>
              <SectionHeader title="Así funciona el tablero" />
              <p className="text-sm leading-relaxed text-slate-600">
                Cada jugador ocupa el brazo de su ficha de identidad. Cuando el equipo resuelve un reto involucrando
                al menos <b className="text-slate-800">{MIN_STYLES_TO_PLACE} estilos distintos</b>, su ficha se mueve
                al <b className="text-slate-800">punto de encuentro</b> central. Los 6 puntos del centro representan
                los 6 mazos y se llenan cuando el equipo lo logra.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MiniFact Icon={IconUsers} label="Jugadores" value="4-6 por equipo" />
                <MiniFact Icon={IconClock} label="Por ronda" value={`${ROUND_MINUTES.min}-${ROUND_MINUTES.max} min`} />
                <MiniFact Icon={IconLayers} label="Mazos" value={`${DECKS.length} temáticos`} />
              </div>
            </div>
          </div>

          {/* Estilos + mazos */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="card p-6">
              <SectionHeader title="Fichas de identidad (DISC)" />
              <div className="space-y-3">
                {DISC_STYLES.map((s) => (
                  <div key={s.id} className="flex items-start gap-3">
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
                      style={{ background: s.color }}
                    >
                      {s.id}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{s.label}</div>
                      <div className="text-xs leading-relaxed text-slate-500">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card flex flex-col p-6">
              <SectionHeader title="Mazos de retos" />
              <div className="flex flex-wrap gap-2">
                {DECKS.map((d) => (
                  <span key={d.id} className="chip bg-slate-100 text-slate-600">
                    <span>{d.icon}</span> {d.label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Gana el equipo que más fichas coloque tras jugar los {DECKS.length} mazos. Al final, un mazo de cierre
                alimenta la matriz de aprendizaje del reporte.
              </p>
              <Link to="/app/biblioteca" className="btn-ghost btn-sm mt-auto w-full">
                Ver todas las cartas en la biblioteca
              </Link>
            </div>
          </div>

          {/* Sesiones */}
          <div className="mt-9">
            <SectionHeader title="Sesiones de este juego" action="Ver todas" actionTo="/app/sesiones" />
            {sessions.length === 0 ? (
              <EmptyState
                emoji="🎯"
                title="Todavía no has creado una sesión"
                description="Arma los equipos, asigna las fichas DISC y guía la dinámica desde la consola del facilitador."
                action={
                  <button onClick={() => navigate(`/app/juegos/${gameId}/nueva`)} className="btn-primary">
                    Crear la primera sesión
                  </button>
                }
              />
            ) : (
              <div className="card divide-y divide-slate-100">
                {sessions.map((s) => {
                  const participants = (s.teams || []).reduce((n, t) => n + t.participants.length, 0)
                  const deckIndex = Math.min(s.currentDeckIndex ?? 0, DECKS.length)
                  return (
                    <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-slate-50/70">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="truncate text-sm font-bold text-slate-900">{s.name}</h3>
                          <StatusBadge status={s.status} />
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span>Creada {fmt(s.createdAt)}</span>
                          <span className="text-slate-300">·</span>
                          <span>{(s.teams || []).length} equipos · {participants} personas</span>
                        </div>
                        {s.status !== 'draft' && <ProgressBar className="mt-2.5 max-w-xs" value={deckIndex} max={DECKS.length} />}
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
        </>
      )}
    </AppShell>
  )
}

function MiniFact({ Icon, label, value }) {
  return (
    <div className="panel flex items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-brand-500" />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="truncate text-xs font-semibold text-slate-700">{value}</div>
      </div>
    </div>
  )
}
