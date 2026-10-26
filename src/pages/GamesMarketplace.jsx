import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { PageHeader, SectionHeader } from '../components/ui'
import { IconArrowRight } from '../components/icons'
import { OWN_GAMES, PARTNER_GAMES } from '../lib/games'
import { useCompanySessions } from '../lib/store'

export default function GamesMarketplace() {
  const sessions = useCompanySessions()

  return (
    <AppShell>
      <PageHeader
        eyebrow={<span className="section-title">EXPERIA PLAY · Marketplace</span>}
        title="Juegos"
        description="El catálogo de productos gamificados de Eureka. Los propios se juegan desde la plataforma; los de alianza son kits físicos que se solicitan."
      />

      <SectionHeader title="Propios · digitales y físicos">
        Desarrollados por Eureka. Se juegan aquí mismo, con reporte automático al cerrar la sesión.
      </SectionHeader>
      <div className="grid gap-5 sm:grid-cols-2">
        {OWN_GAMES.map((g) => (
          <GameCard key={g.id} game={g} count={sessions.filter((s) => s.gameId === g.id).length} featured />
        ))}
      </div>

      <div className="mt-10">
        <SectionHeader title="En alianza con Formactiva · kits físicos">
          Experiencias presenciales con material tangible. Se solicitan al equipo de Eureka.
        </SectionHeader>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PARTNER_GAMES.map((g) => (
            <GameCard key={g.id} game={g} compact />
          ))}
        </div>
      </div>
    </AppShell>
  )
}

function GameCard({ game, count = 0, featured = false, compact = false }) {
  const live = game.status === 'available'

  return (
    <Link
      to={`/app/juegos/${game.id}`}
      className={`card card-hover group flex flex-col overflow-hidden ${live ? '' : 'opacity-95'}`}
    >
      <div
        className={`relative flex items-center justify-center overflow-hidden ${featured ? 'h-40' : 'h-24'}`}
        style={{ background: `linear-gradient(135deg, ${game.color}1f, ${game.color}08)` }}
      >
        <div className="bg-dots absolute inset-0 opacity-60" />
        <span className={`relative transition duration-300 group-hover:scale-110 ${featured ? 'text-6xl' : 'text-4xl'}`}>
          {game.icon}
        </span>
        <span className="absolute right-3 top-3">
          {live ? (
            <span className="chip bg-white/90 text-teal-700 shadow-sm">● Jugable</span>
          ) : (
            <span className="chip bg-white/90 text-slate-500 shadow-sm">Kit físico</span>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: game.color }}>
          {game.category}
        </span>
        <h2 className={`mt-1.5 font-extrabold tracking-tight text-slate-900 ${featured ? 'text-lg' : 'text-sm'}`}>
          {game.name}
        </h2>
        <p className={`mt-2 flex-1 leading-relaxed text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          {game.tagline}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
          <span className="text-xs font-medium text-slate-400">
            {live ? `${count} ${count === 1 ? 'sesión' : 'sesiones'}` : game.partner}
          </span>
          <span
            className="flex items-center gap-1 text-xs font-bold transition group-hover:gap-2"
            style={{ color: live ? game.color : '#94a3b8' }}
          >
            {live ? 'Abrir' : 'Ver kit'}
            <IconArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
