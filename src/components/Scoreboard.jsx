import { DECKS } from '../lib/discGame'
import { currentStreak, teamPoints } from '../lib/achievements'
import { IconTrophy } from './icons'

// Marcador en vivo durante la partida: ranking, puntos, racha y fichas.

export default function Scoreboard({ session }) {
  const rows = session.teams
    .map((team) => {
      const rounds = session.rounds.filter((r) => r.teamId === team.id)
      return {
        team,
        rounds,
        placed: rounds.filter((r) => r.placed).length,
        points: teamPoints(team, rounds),
        streak: currentStreak(rounds)
      }
    })
    .sort((a, b) => b.points - a.points || b.placed - a.placed)

  const leader = rows[0]?.points ?? 0

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-2.5">
        <IconTrophy className="h-4 w-4 text-amber-500" />
        <span className="section-title">Marcador en vivo</span>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row, i) => {
          const isLeader = row.points === leader && leader > 0
          return (
            <div key={row.team.id} className="flex items-center gap-3 px-5 py-3">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${
                  i === 0 ? 'bg-amber-400/20 text-amber-600' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-slate-800">{row.team.name}</span>
                  {isLeader && <IconTrophy className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                  {row.streak >= 2 && (
                    <span className="chip shrink-0 bg-coral-500/10 text-coral-600">🔥 Racha x{row.streak}</span>
                  )}
                </div>
                <div className="mt-1.5 flex gap-1">
                  {Array.from({ length: DECKS.length }).map((_, idx) => {
                    const r = row.rounds[idx]
                    return (
                      <span
                        key={idx}
                        className={`h-1.5 w-full max-w-[26px] rounded-full ${
                          !r ? 'bg-slate-100' : r.placed ? 'bg-teal-500' : 'bg-slate-300'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div key={row.points} className="tabular animate-score-bump text-lg font-extrabold text-slate-900">
                  {row.points}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {row.placed} fichas
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
