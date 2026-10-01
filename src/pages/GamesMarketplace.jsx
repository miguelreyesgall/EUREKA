import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { PageHeader } from '../components/ui'
import { IconArrowRight } from '../components/icons'
import { GAMES } from '../lib/games'
import { useCompanySessions } from '../lib/store'

export default function GamesMarketplace() {
  const sessions = useCompanySessions()
  const available = GAMES.filter((g) => g.status === 'available').length

  return (
    <AppShell>
      <PageHeader
        eyebrow={<span className="section-title">Marketplace</span>}
        title="Juegos"
        description="Elige una dinámica para crear una sesión, guiarla y generar su reporte automático."
        actions={
          <span className="chip bg-slate-100 text-slate-600">
            {available} de {GAMES.length} activos
          </span>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {GAMES.map((g) => {
          const count = sessions.filter((s) => s.gameId === g.id).length
          const live = g.status === 'available'
          return (
            <Link
              key={g.id}
              to={`/app/juegos/${g.id}`}
              className={`card card-hover group flex flex-col overflow-hidden ${live ? '' : 'opacity-90'}`}
            >
              <div
                className="relative flex h-36 items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${g.color}1f, ${g.color}08)` }}
              >
                <div className="bg-dots absolute inset-0 opacity-60" />
                <span className="relative text-6xl transition duration-300 group-hover:scale-110">{g.icon}</span>
                <span className="absolute right-3 top-3">
                  {live ? (
                    <span className="chip bg-white/90 text-teal-700 shadow-sm">● Disponible</span>
                  ) : (
                    <span className="chip bg-white/90 text-slate-500 shadow-sm">Próximamente</span>
                  )}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: g.color }}>
                  {g.category}
                </span>
                <h2 className="mt-1.5 text-lg font-extrabold tracking-tight text-slate-900">{g.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{g.tagline}</p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
                  <span className="text-xs font-medium text-slate-400">
                    {live ? `${count} ${count === 1 ? 'sesión' : 'sesiones'}` : 'Sin habilitar'}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs font-bold transition group-hover:gap-2"
                    style={{ color: live ? g.color : '#94a3b8' }}
                  >
                    {live ? 'Abrir' : 'Ver detalle'}
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </AppShell>
  )
}
