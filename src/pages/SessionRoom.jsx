import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import DiscBoard from '../components/DiscBoard'
import CardDeck from '../components/CardDeck'
import RoundTimer from '../components/RoundTimer'
import Scoreboard from '../components/Scoreboard'
import Confetti from '../components/Confetti'
import { EmptyState, PageHeader, ProgressBar, SectionHeader } from '../components/ui'
import { IconCheck, IconPlay, IconSparkles, IconTarget, IconTrophy } from '../components/icons'
import { actions, useSession } from '../lib/store'
import { CLOSING_DECK, DECKS, DISC_STYLES, MIN_STYLES_TO_PLACE, distinctStyles, pickCard } from '../lib/discGame'
import { currentStreak, teamBadges, teamPoints } from '../lib/achievements'
import { randomClosingAnswers } from '../lib/fakeData'
import { GAME_MAP } from '../lib/games'
import MandoRoom from './mando/MandoRoom'
import { toast } from '../lib/toast'

export default function SessionRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = useSession(id)

  if (!session) {
    return (
      <AppShell>
        <EmptyState
          emoji="🔍"
          title="Sesión no encontrada"
          description="Puede que haya sido eliminada o que el enlace no sea válido."
          action={
            <button onClick={() => navigate('/app/sesiones')} className="btn-primary">
              Ver todas las sesiones
            </button>
          }
        />
      </AppShell>
    )
  }

  const game = GAME_MAP[session.gameId]
  const isMando = session.gameId === 'mando-integro'
  const deckIndex = isMando ? 0 : Math.min(session.currentDeckIndex ?? 0, DECKS.length)
  const playing = !isMando && session.status === 'in_progress' && session.currentDeckIndex < DECKS.length

  return (
    <AppShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Juegos', to: '/app/juegos' },
          { label: game?.name || 'Juego', to: `/app/juegos/${session.gameId}` },
          { label: session.name }
        ]}
        eyebrow={<StatusBadge status={session.status} />}
        title={session.name}
        description={session.purpose || 'Sin objetivo definido'}
        actions={
          session.status === 'completed' && (
            <button onClick={() => navigate(`/app/sesion/${id}/reporte`)} className="btn-primary">
              <IconTrophy className="h-4 w-4" />
              Ver reporte
            </button>
          )
        }
      />

      {isMando && <MandoRoom session={session} />}

      {!isMando && session.status === 'in_progress' && (
        <div className="card mb-5 flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-[160px] flex-1">
            <div className="mb-1.5 flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Progreso de la partida</span>
              <span>
                {deckIndex} / {DECKS.length} mazos
              </span>
            </div>
            <ProgressBar value={deckIndex} max={DECKS.length} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DECKS.map((d, i) => (
              <span
                key={d.id}
                title={d.label}
                className={`grid h-8 w-8 place-items-center rounded-xl text-sm transition-all ${
                  i < deckIndex
                    ? 'bg-teal-500/15'
                    : i === deckIndex
                      ? 'scale-110 bg-brand-600 shadow-lift'
                      : 'bg-slate-100 opacity-45'
                }`}
              >
                {d.icon}
              </span>
            ))}
          </div>
        </div>
      )}

      {!isMando && session.status === 'draft' && <Lobby session={session} />}
      {playing && <RoundConsole session={session} />}
      {!isMando && session.status === 'in_progress' && session.currentDeckIndex >= DECKS.length && (
        <ClosingConsole session={session} />
      )}
      {!isMando && session.status === 'completed' && <VictoryScreen session={session} />}
    </AppShell>
  )
}

/* ------------------------------------------------------------------ Lobby */

function Lobby({ session }) {
  const totalPeople = session.teams.reduce((n, t) => n + t.participants.length, 0)

  return (
    <div>
      <div className="card relative overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-800 via-brand-600 to-indigo-600 p-8 text-white">
          <div className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="chip bg-white/15 text-white backdrop-blur">Sala de espera</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight">¿Listos para jugar?</h2>
              <p className="mt-2 max-w-lg text-sm text-brand-100">
                {session.teams.length} equipos · {totalPeople} jugadores · {DECKS.length} mazos por delante. Reúnelos
                alrededor del tablero: esta pantalla lleva el marcador.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {DECKS.map((d) => (
                  <span key={d.id} className="chip bg-white/10 text-white backdrop-blur">
                    <span>{d.icon}</span> {d.label}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                actions.startSession(session.id)
                toast.success('¡Que empiece el juego! Mazo 1 listo')
              }}
              className="btn btn-lg animate-float bg-white text-brand-700 shadow-float hover:bg-brand-50"
            >
              <IconPlay className="h-4 w-4" />
              Iniciar partida
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {session.teams.map((team) => {
          const covered = new Set(team.participants.map((p) => p.style).filter(Boolean))
          return (
            <div key={team.id} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{team.name}</h3>
                  <p className="text-xs text-slate-400">{team.participants.length} jugadores</p>
                </div>
                <span
                  className={`chip ${
                    covered.size >= MIN_STYLES_TO_PLACE ? 'bg-teal-500/10 text-teal-700' : 'bg-amber-400/15 text-amber-600'
                  }`}
                >
                  {covered.size}/4 estilos
                </span>
              </div>
              <div className="mt-4 flex justify-center">
                <DiscBoard team={team} rounds={[]} selectable={false} size="md" />
              </div>
              {covered.size < MIN_STYLES_TO_PLACE && (
                <p className="mt-3 text-center text-xs text-amber-600">
                  ⚠️ Con menos de {MIN_STYLES_TO_PLACE} estilos distintos este equipo no podrá colocar fichas.
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- Ronda en juego */

function RoundConsole({ session }) {
  const deckIndex = session.currentDeckIndex
  const deck = DECKS[deckIndex]
  const card = useMemo(() => pickCard(session.id, deck), [session.id, deck])

  const [revealed, setRevealed] = useState(false)
  const [selections, setSelections] = useState({})
  const [confetti, setConfetti] = useState(0)

  useEffect(() => {
    setRevealed(false)
    setSelections({})
  }, [deckIndex])

  const recordedTeamIds = new Set(session.rounds.filter((r) => r.deckId === deck.id).map((r) => r.teamId))
  const allRecorded = session.teams.every((t) => recordedTeamIds.has(t.id))

  const toggleParticipant = (teamId, pid) =>
    setSelections((sel) => {
      const cur = new Set(sel[teamId] || [])
      cur.has(pid) ? cur.delete(pid) : cur.add(pid)
      return { ...sel, [teamId]: cur }
    })

  const register = (team) => {
    const ids = [...(selections[team.id] || [])]
    const styles = distinctStyles(team, ids)
    const placed = styles.length >= MIN_STYLES_TO_PLACE
    actions.recordRoundResult(session.id, { deckId: deck.id, cardText: card, teamId: team.id, participantIds: ids })

    if (placed) {
      setConfetti((c) => c + 1)
      const bonus = styles.length === DISC_STYLES.length ? ' ¡Pleno DISC! +25 pts extra' : ''
      toast.success(`🎯 ${team.name} colocó su ficha.${bonus}`)
    } else {
      toast.info(`${team.name} no reunió ${MIN_STYLES_TO_PLACE} estilos. Pierde la ronda.`)
    }
  }

  return (
    <div className="space-y-5">
      <Confetti trigger={confetti} intensity="burst" />

      {/* Mesa de juego */}
      <div key={deckIndex} className="animate-drop-in grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card felt relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_80px_rgba(0,0,0,0.55)]" />
          <div className="relative flex flex-col items-center px-6 py-9">
            <div className="mb-7 text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">
                Mazo {deckIndex + 1} de {DECKS.length}
              </div>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-white">
                {deck.icon} {deck.label}
              </h2>
            </div>

            <CardDeck
              deck={deck}
              card={card}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
              roundNumber={deckIndex + 1}
              totalRounds={DECKS.length}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card flex items-center justify-center p-5">
            <RoundTimer resetKey={deckIndex} />
          </div>
          <Scoreboard session={session} />
        </div>
      </div>

      {/* Mesas de juego */}
      {revealed && (
        <div
          className={`grid gap-4 ${
            session.teams.length === 1 ? 'mx-auto max-w-xl' : 'md:grid-cols-2'
          }`}
        >
          {session.teams.map((team) => {
            const done = recordedTeamIds.has(team.id)
            const round = session.rounds.find((r) => r.deckId === deck.id && r.teamId === team.id)
            const selectedIds = [...(selections[team.id] || [])]
            const styles = distinctStyles(team, selectedIds)
            const canPlace = styles.length >= MIN_STYLES_TO_PLACE
            const teamRoundsSoFar = session.rounds.filter((r) => r.teamId === team.id)
            const streak = currentStreak(teamRoundsSoFar)

            return (
              <div
                key={team.id}
                className={`card overflow-hidden transition-all duration-300 ${
                  done
                    ? round.placed
                      ? 'border-teal-300'
                      : 'border-slate-200'
                    : canPlace
                      ? 'border-teal-400 shadow-lift'
                      : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate text-base font-extrabold text-slate-900">{team.name}</h3>
                    {streak >= 2 && <span className="chip bg-coral-500/10 text-coral-600">🔥 x{streak}</span>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="tabular text-sm font-extrabold text-slate-700">
                      {teamPoints(team, teamRoundsSoFar)}
                      <span className="ml-1 text-[10px] font-bold uppercase text-slate-400">pts</span>
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  {done ? (
                    <div
                      className={`mb-4 flex items-center gap-3 rounded-xl p-3 ${
                        round.placed ? 'bg-teal-500/10' : 'bg-slate-100'
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white ${
                          round.placed ? 'bg-teal-500' : 'bg-slate-400'
                        }`}
                      >
                        {round.placed ? <IconCheck className="h-4 w-4" /> : '✕'}
                      </span>
                      <div>
                        <div className={`text-sm font-bold ${round.placed ? 'text-teal-800' : 'text-slate-600'}`}>
                          {round.placed ? '¡Ficha colocada!' : 'Ronda perdida'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {distinctStyles(team, round.participantIds).length} estilos participaron
                          {round.placed ? ` · +${100 + (distinctStyles(team, round.participantIds).length - MIN_STYLES_TO_PLACE) * 25} pts` : ''}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mb-4 text-center text-xs font-medium text-slate-400">
                      Toca las fichas de quienes participaron visiblemente en la solución
                    </p>
                  )}

                  <div className="flex justify-center">
                    <DiscBoard
                      team={team}
                      rounds={teamRoundsSoFar}
                      selectable={!done}
                      selectedIds={done ? round.participantIds : selectedIds}
                      onToggle={(pid) => toggleParticipant(team.id, pid)}
                      pendingCanPlace={!done && canPlace}
                      size={session.teams.length <= 2 ? 'lg' : 'md'}
                    />
                  </div>

                  {!done && (
                    <button
                      onClick={() => register(team)}
                      className={`mt-5 w-full transition-all ${
                        canPlace ? 'btn-teal btn-lg shadow-lift' : 'btn-ghost'
                      }`}
                    >
                      {canPlace ? (
                        <>
                          <IconTarget className="h-4 w-4" />
                          ¡Colocar ficha en el punto de encuentro!
                        </>
                      ) : (
                        `Faltan ${MIN_STYLES_TO_PLACE - styles.length} estilos · registrar sin ficha`
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {revealed && allRecorded && (
        <button
          onClick={() => {
            actions.advanceDeck(session.id)
            toast.info(
              deckIndex === DECKS.length - 1 ? 'Última ronda jugada · vamos al cierre' : `¡Mazo ${deckIndex + 2}!`
            )
          }}
          className="btn-primary btn-lg w-full animate-drop-in"
        >
          {deckIndex === DECKS.length - 1 ? '🏁 Ir al cierre' : `Siguiente mazo · ${DECKS[deckIndex + 1].icon} ${DECKS[deckIndex + 1].label} →`}
        </button>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- Cierre */

function ClosingConsole({ session }) {
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(
      CLOSING_DECK.map((c) => [c.deckId, session.closingAnswers?.find((a) => a.deckId === c.deckId)?.answer || ''])
    )
  )
  const navigate = useNavigate()

  const submit = () => {
    const closingAnswers = CLOSING_DECK.map((c) => ({ deckId: c.deckId, answer: answers[c.deckId] || '' }))
    actions.saveClosingAnswers(session.id, closingAnswers)
    actions.completeSession(session.id)
    toast.success('¡Partida cerrada! Generando reporte con IA')
    navigate(`/app/sesion/${session.id}/reporte`)
  }

  const filled = CLOSING_DECK.filter((c) => answers[c.deckId]?.trim()).length

  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <div className="relative flex flex-wrap items-start justify-between gap-4 bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white">
          <div className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div className="relative">
            <span className="chip bg-white/15 text-white backdrop-blur">🏁 Mazo de cierre</span>
            <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight">Los {DECKS.length} mazos están jugados</h2>
            <p className="mt-1 max-w-xl text-sm text-teal-50">
              Cierren en plenaria: estas respuestas se convierten en la matriz de aprendizaje del reporte.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAnswers(randomClosingAnswers(CLOSING_DECK))}
            className="btn relative shrink-0 bg-white/15 text-white backdrop-blur hover:bg-white/25"
          >
            🎲 Generar respuestas ficticias
          </button>
        </div>
        <div className="flex items-center gap-3 px-6 py-3">
          <ProgressBar value={filled} max={CLOSING_DECK.length} />
          <span className="tabular shrink-0 text-xs font-bold text-slate-400">
            {filled}/{CLOSING_DECK.length}
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {CLOSING_DECK.map((c) => {
          const deck = DECKS.find((d) => d.id === c.deckId)
          const done = !!answers[c.deckId]?.trim()
          return (
            <div key={c.deckId} className={`card p-5 transition ${done ? 'border-teal-200' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="chip bg-slate-100 text-slate-600">
                  {deck?.icon} {deck?.label}
                </span>
                {done && <IconCheck className="h-4 w-4 text-teal-600" />}
              </div>
              <p className="mt-2.5 text-sm font-semibold text-slate-800">{c.question}</p>
              <textarea
                className="input mt-3 min-h-[76px] resize-y"
                value={answers[c.deckId]}
                onChange={(e) => setAnswers((a) => ({ ...a, [c.deckId]: e.target.value }))}
                placeholder="Respuesta del grupo…"
              />
            </div>
          )
        })}
      </div>

      <button onClick={submit} className="btn-primary btn-lg w-full">
        <IconSparkles className="h-4 w-4" />
        Cerrar partida y generar reporte
      </button>
    </div>
  )
}

/* ------------------------------------------------------------- Victoria */

function VictoryScreen({ session }) {
  const [confetti, setConfetti] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setConfetti(1), 250)
    return () => clearTimeout(t)
  }, [])

  const ranking = session.teams
    .map((team) => {
      const rounds = session.rounds.filter((r) => r.teamId === team.id)
      return {
        team,
        rounds,
        placed: rounds.filter((r) => r.placed).length,
        points: teamPoints(team, rounds),
        badges: teamBadges(team, rounds)
      }
    })
    .sort((a, b) => b.points - a.points || b.placed - a.placed)

  const champion = ranking[0]
  const podiumOrder = [ranking[1], ranking[0], ranking[2]].filter(Boolean)
  const podiumHeights = { 0: 'h-16', 1: 'h-24', 2: 'h-12' }

  return (
    <div className="space-y-5">
      <Confetti trigger={confetti} intensity="victory" />

      {/* Campeón */}
      <div className="card relative overflow-hidden">
        <div className="relative bg-gradient-to-br from-amber-500 via-amber-400 to-orange-400 p-8 text-center text-white">
          <div className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div className="relative">
            <div className="animate-float text-6xl">🏆</div>
            <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-amber-100">Equipo campeón</div>
            <h2 className="mt-1 text-4xl font-extrabold tracking-tight">{champion?.team.name || '—'}</h2>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
              <span className="rounded-full bg-white/20 px-4 py-1.5 backdrop-blur">
                {champion?.points ?? 0} puntos
              </span>
              <span className="rounded-full bg-white/20 px-4 py-1.5 backdrop-blur">
                {champion?.placed ?? 0}/{champion?.rounds.length ?? 0} fichas
              </span>
            </div>
          </div>
        </div>

        {/* Podio */}
        {podiumOrder.length > 1 && (
          <div className="flex items-end justify-center gap-3 px-6 pb-6 pt-8">
            {podiumOrder.map((row, i) => {
              const rank = ranking.indexOf(row)
              return (
                <div key={row.team.id} className="flex w-28 flex-col items-center sm:w-36">
                  <div className="text-2xl">{['🥈', '🥇', '🥉'][i]}</div>
                  <div className="mt-1 w-full truncate text-center text-xs font-bold text-slate-700">
                    {row.team.name}
                  </div>
                  <div className="tabular text-[11px] font-semibold text-slate-400">{row.points} pts</div>
                  <div
                    className={`mt-2 grid w-full place-items-center rounded-t-xl ${podiumHeights[i]} ${
                      rank === 0
                        ? 'bg-gradient-to-t from-amber-400 to-amber-300'
                        : rank === 1
                          ? 'bg-gradient-to-t from-slate-300 to-slate-200'
                          : 'bg-gradient-to-t from-orange-300 to-orange-200'
                    }`}
                  >
                    <span className="text-lg font-extrabold text-white/90">{rank + 1}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tableros finales + logros */}
      <div className="grid gap-4 lg:grid-cols-2">
        {ranking.map((row, i) => (
          <div key={row.team.id} className={`card p-6 ${i === 0 ? 'border-amber-300' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-extrabold ${
                    i === 0 ? 'bg-amber-400/20 text-amber-600' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">{row.team.name}</h3>
              </div>
              <span className="tabular text-lg font-extrabold text-slate-900">
                {row.points}
                <span className="ml-1 text-[10px] font-bold uppercase text-slate-400">pts</span>
              </span>
            </div>

            <div className="mt-4 flex justify-center">
              <DiscBoard team={row.team} rounds={row.rounds} selectable={false} size="md" />
            </div>

            {row.badges.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="section-title mb-2">Logros desbloqueados</div>
                <div className="flex flex-wrap gap-2">
                  {row.badges.map((b) => (
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
          </div>
        ))}
      </div>

      <SectionHeader title="Resumen">
        {session.rounds.filter((r) => r.placed).length} de {session.rounds.length} fichas colocadas en total durante la
        partida.
      </SectionHeader>
    </div>
  )
}
