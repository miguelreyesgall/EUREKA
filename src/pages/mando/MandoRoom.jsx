import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Balanza from '../../components/Balanza'
import SenderoBoard from '../../components/SenderoBoard'
import DiagnosticRoster from '../../components/DiagnosticRoster'
import Confetti from '../../components/Confetti'
import RoundTimer from '../../components/RoundTimer'
import { ProgressBar, SectionHeader, Tabs } from '../../components/ui'
import { IconArrowRight, IconCheck, IconPlay, IconSparkles } from '../../components/icons'
import { actions } from '../../lib/store'
import { toast } from '../../lib/toast'
import {
  CLOSING_GENERAL,
  DILEMMA_DECKS,
  DIMENSIONS,
  DIMENSION_MAP,
  LEARNING_MATRIX_BLOCKS,
  SUMMIT,
  computeMandoReport,
  dilemmaForRound,
  isBalanced
} from '../../lib/mandoIntegro'
import { randomMandoClosing } from '../../lib/fakeData'

export default function MandoRoom({ session }) {
  const playing = session.status === 'in_progress' && session.position < SUMMIT
  const closing = session.status === 'in_progress' && session.position >= SUMMIT

  return (
    <>
      {session.status === 'draft' && <Lobby session={session} />}
      {playing && <TurnConsole session={session} />}
      {closing && <ClosingConsole session={session} />}
      {session.status === 'completed' && <Summit session={session} />}
    </>
  )
}

/* ------------------------------------------------------------------ Lobby */

function Lobby({ session }) {
  const withDiag = session.participants.filter((p) => p.diagnostic)
  const pending = session.participants.length - withDiag.length

  return (
    <div>
      <div className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-sky-700 via-sky-600 to-blue-700 p-8 text-white">
          <div className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="chip bg-white/15 text-white backdrop-blur">Sala de espera</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight">De la Base a la Cumbre</h2>
              <p className="mt-2 max-w-xl text-sm text-sky-100">
                {session.participants.length} líderes · {SUMMIT} casillas. En cada turno un líder distinto resuelve un
                dilema eligiendo Cabeza, Corazón o Manos. La Balanza arranca donde los deja su diagnóstico.
              </p>
            </div>
            <button
              onClick={() => {
                actions.startMandoSession(session.id)
                toast.success('¡Arranca el ascenso! Primer dilema listo')
              }}
              className="btn btn-lg bg-white text-sky-700 shadow-float hover:bg-sky-50"
            >
              <IconPlay className="h-4 w-4" />
              Iniciar partida
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <DiagnosticRoster session={session} />
      </div>
    </div>
  )
}

/* --------------------------------------------------------- Turno en juego */

function TurnConsole({ session }) {
  const roundIndex = session.rounds.length
  const { deck, dilemma } = useMemo(() => dilemmaForRound(roundIndex), [roundIndex])
  const leader = session.participants[session.turnIndex % session.participants.length]
  const leaderDom = leader?.diagnostic ? DIMENSION_MAP[leader.diagnostic.dominant] : null

  const [revealed, setRevealed] = useState(false)
  const [confetti, setConfetti] = useState(0)

  const choose = (dimId) => {
    const dim = DIMENSION_MAP[dimId]
    const preview = { ...session.balance, [dimId]: (session.balance[dimId] ?? 0) + 1 }
    const willBalance = isBalanced(preview)

    actions.recordMandoChoice(session.id, dimId)
    setRevealed(false)

    if (willBalance) {
      setConfetti((c) => c + 1)
      toast.success(`${leader.name} eligió ${dim.label} · Balanza en equilibrio, +1 casilla extra`)
    } else {
      toast.info(`${leader.name} eligió ${dim.label} · la Balanza quedó inclinada, sin bonificación`)
    }
  }

  return (
    <div className="space-y-5">
      <Confetti trigger={confetti} intensity="burst" />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Dilema */}
        <div key={roundIndex} className="card animate-drop-in overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
            <span className="chip" style={{ background: `${deck.color}18`, color: deck.color }}>
              {deck.icon} {deck.label}
            </span>
            <span className="text-xs font-semibold text-slate-400">Turno {roundIndex + 1}</span>
          </div>

          {/* Líder de turno */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Líder de turno</span>
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white"
              style={{ background: leaderDom?.color || '#94a3b8' }}
            >
              {leader?.name?.[0]?.toUpperCase()}
            </span>
            <span className="text-sm font-extrabold text-slate-900">{leader?.name}</span>
            {leaderDom && (
              <span className="chip" style={{ background: `${leaderDom.color}18`, color: leaderDom.color }}>
                Suele liderar con {leaderDom.label}
              </span>
            )}
          </div>

          <div className="p-6">
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="group grid w-full place-items-center rounded-2xl border-2 border-dashed border-slate-200 py-12 transition hover:border-sky-300 hover:bg-sky-50/40"
              >
                <span className="text-4xl transition group-hover:scale-110">{deck.icon}</span>
                <span className="mt-3 text-sm font-bold text-slate-700">Revelar dilema</span>
                <span className="mt-1 text-xs text-slate-400">Léelo en voz alta y deja que el equipo opine</span>
              </button>
            ) : (
              <>
                <div className="animate-flip-in rounded-2xl bg-gradient-to-br from-slate-900 to-ink-950 p-6 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300">El dilema</div>
                  <p className="mt-2.5 text-lg font-semibold leading-snug">“{dilemma.text}”</p>
                </div>

                <p className="mt-5 text-center text-xs font-medium text-slate-400">
                  El equipo opina, pero <b className="text-slate-600">{leader?.name}</b> decide
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {DIMENSIONS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => choose(d.id)}
                      className="group flex flex-col rounded-2xl border-2 p-4 text-left transition hover:-translate-y-1"
                      style={{ borderColor: `${d.color}44`, background: `${d.color}0a` }}
                    >
                      <span
                        className="grid h-9 w-9 place-items-center rounded-xl text-xs font-extrabold text-white"
                        style={{ background: d.color }}
                      >
                        {d.label[0]}
                      </span>
                      <span className="mt-2.5 text-sm font-extrabold" style={{ color: d.color }}>
                        {d.label}
                      </span>
                      <span className="mt-1.5 flex-1 text-xs leading-relaxed text-slate-600">{dilemma[d.id]}</span>
                      <span
                        className="mt-3 flex items-center gap-1 text-[11px] font-bold transition group-hover:gap-2"
                        style={{ color: d.color }}
                      >
                        Elegir <IconArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Estado del tablero */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <Balanza balance={session.balance} />
          </div>
          <div className="card p-5">
            <SenderoBoard position={session.position} />
          </div>
          <div className="card flex items-center justify-center p-5">
            <RoundTimer resetKey={roundIndex} />
          </div>
        </div>
      </div>

      {/* Turnos jugados */}
      {session.rounds.length > 0 && (
        <div className="card p-5">
          <SectionHeader title="Turnos jugados" />
          <div className="flex flex-wrap gap-2">
            {session.rounds.map((r, i) => {
              const d = DIMENSION_MAP[r.choice]
              return (
                <span
                  key={i}
                  className="chip"
                  style={{ background: `${d.color}14`, color: d.color }}
                  title={`${r.leaderName} · ${r.balanced ? '+2 casillas' : '+1 casilla'}`}
                >
                  {r.leaderName?.split(' ')[0]} → {d.label}
                  {r.balanced && <IconCheck className="h-3 w-3" />}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- Cierre */

function ClosingConsole({ session }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('debrief')
  const [closingAnswers, setClosingAnswers] = useState(() => session.closingAnswers || {})
  const [matrix, setMatrix] = useState(() => session.learningMatrix || {})
  const [commitments, setCommitments] = useState(() => {
    const byId = Object.fromEntries((session.commitments || []).map((c) => [c.participantId, c]))
    return session.participants.map(
      (p) =>
        byId[p.id] || {
          participantId: p.id,
          dimension: p.diagnostic?.weakest || 'corazon',
          text: '',
          reviewDate: ''
        }
    )
  })

  const fillFake = () => {
    const fake = randomMandoClosing(session)
    setClosingAnswers(fake.closingAnswers)
    setMatrix(fake.learningMatrix)
    setCommitments(fake.commitments)
    toast.success('Cierre rellenado con datos ficticios')
  }

  const submit = () => {
    actions.saveMandoClosing(session.id, { closingAnswers, learningMatrix: matrix, commitments })
    actions.completeSession(session.id)
    toast.success('¡Cumbre alcanzada! Generando reporte')
    navigate(`/app/sesion/${session.id}/reporte`)
  }

  const setMatrixField = (pid, blockId, value) =>
    setMatrix((m) => ({ ...m, [pid]: { ...(m[pid] || {}), [blockId]: value } }))

  const setCommitment = (pid, patch) =>
    setCommitments((cs) => cs.map((c) => (c.participantId === pid ? { ...c, ...patch } : c)))

  const filledDebrief = DILEMMA_DECKS.filter((d) => closingAnswers[d.id]?.trim()).length
  const filledCommitments = commitments.filter((c) => c.text.trim()).length

  return (
    <div className="space-y-5">
      <Confetti trigger={1} intensity="victory" />

      <div className="card overflow-hidden">
        <div className="relative flex flex-wrap items-start justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white">
          <div className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div className="relative">
            <span className="chip bg-white/15 text-white backdrop-blur">🏔️ Cumbre alcanzada</span>
            <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight">Es hora del debrief</h2>
            <p className="mt-1 max-w-xl text-sm text-emerald-50">
              Aquí está el verdadero aprendizaje: contrastar la Balanza final con cómo lidera cada quien en su equipo
              real.
            </p>
          </div>
          <button onClick={fillFake} className="btn relative shrink-0 bg-white/15 text-white backdrop-blur hover:bg-white/25">
            🎲 Rellenar con datos ficticios
          </button>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'debrief', label: `Debrief ${filledDebrief}/${DILEMMA_DECKS.length}` },
          { value: 'matriz', label: 'Matriz de aprendizaje' },
          { value: 'compromisos', label: `Compromisos ${filledCommitments}/${commitments.length}` }
        ]}
      />

      {tab === 'debrief' && (
        <div className="grid gap-3 md:grid-cols-2">
          {DILEMMA_DECKS.map((d) => (
            <div key={d.id} className="card p-5">
              <span className="chip" style={{ background: `${d.color}14`, color: d.color }}>
                {d.icon} {d.label}
              </span>
              <p className="mt-2.5 text-sm font-semibold text-slate-800">{d.closing}</p>
              <textarea
                className="input mt-3 min-h-[76px] resize-y"
                value={closingAnswers[d.id] || ''}
                onChange={(e) => setClosingAnswers((a) => ({ ...a, [d.id]: e.target.value }))}
                placeholder="Respuesta del grupo…"
              />
            </div>
          ))}
          <div className="card border-brand-200 bg-brand-50/40 p-5 md:col-span-2">
            <span className="section-title">Pregunta de cierre general</span>
            <p className="mt-1.5 text-sm font-semibold text-slate-800">{CLOSING_GENERAL}</p>
            <textarea
              className="input mt-3 min-h-[76px] resize-y"
              value={closingAnswers.general || ''}
              onChange={(e) => setClosingAnswers((a) => ({ ...a, general: e.target.value }))}
              placeholder="Lo que respondió el grupo…"
            />
          </div>
        </div>
      )}

      {tab === 'matriz' && (
        <div className="space-y-4">
          {session.participants.map((p) => {
            const weak = p.diagnostic ? DIMENSION_MAP[p.diagnostic.weakest] : null
            return (
              <div key={p.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">{p.name}</h3>
                  {weak && (
                    <span className="chip" style={{ background: `${weak.color}14`, color: weak.color }}>
                      Dimensión más débil: {weak.label}
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {LEARNING_MATRIX_BLOCKS.map((b) => (
                    <div key={b.id}>
                      <label className="label">{b.label}</label>
                      <p className="mb-1.5 text-xs text-slate-400">{b.question}</p>
                      <textarea
                        className="input min-h-[70px] resize-y"
                        value={matrix[p.id]?.[b.id] || ''}
                        onChange={(e) => setMatrixField(p.id, b.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'compromisos' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Una sola acción, específica y con fecha, enfocada en la dimensión que más descuidó cada líder. De aquí
            salen los microlearnings de refuerzo.
          </p>
          {commitments.map((c) => {
            const p = session.participants.find((x) => x.id === c.participantId)
            return (
              <div key={c.participantId} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold text-slate-900">{p?.name}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {DIMENSIONS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setCommitment(c.participantId, { dimension: d.id })}
                        className="chip border-2 transition"
                        style={{
                          borderColor: c.dimension === d.id ? d.color : '#e2e8f0',
                          background: c.dimension === d.id ? `${d.color}18` : '#fff',
                          color: c.dimension === d.id ? d.color : '#64748b'
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px]">
                  <input
                    className="input"
                    value={c.text}
                    onChange={(e) => setCommitment(c.participantId, { text: e.target.value })}
                    placeholder="Mi compromiso concreto de esta semana…"
                  />
                  <div>
                    <input
                      type="date"
                      className="input"
                      value={c.reviewDate}
                      onChange={(e) => setCommitment(c.participantId, { reviewDate: e.target.value })}
                    />
                    <span className="mt-1 block text-[10px] text-slate-400">Lo reviso el día</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button onClick={submit} className="btn-primary btn-lg w-full">
        <IconSparkles className="h-4 w-4" />
        Cerrar sesión y generar reporte
      </button>
    </div>
  )
}

/* ------------------------------------------------------------ Cumbre */

function Summit({ session }) {
  const report = useMemo(() => computeMandoReport(session), [session])
  const [confetti, setConfetti] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setConfetti(1), 250)
    return () => clearTimeout(t)
  }, [])

  const equilibrado = report.ending === 'equilibrado'

  return (
    <div className="space-y-5">
      <Confetti trigger={confetti} intensity="victory" />

      <div className="card overflow-hidden">
        <div
          className={`relative p-8 text-center text-white ${
            equilibrado
              ? 'bg-gradient-to-br from-emerald-600 via-teal-500 to-emerald-500'
              : 'bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500'
          }`}
        >
          <div className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div className="relative">
            <div className="animate-float text-6xl">{equilibrado ? '⚖️' : '😮‍💨'}</div>
            <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">
              Llegaron a la Cumbre
            </div>
            <h2 className="mt-1 text-4xl font-extrabold tracking-tight capitalize">{report.ending}</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/85">
              {equilibrado
                ? 'Mantuvieron las tres dimensiones parejas durante el ascenso.'
                : 'Llegaron, pero inclinados hacia un solo lado — el mejor material para el debrief.'}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
              <span className="rounded-full bg-white/20 px-4 py-1.5 backdrop-blur">
                {report.totalRounds} turnos
              </span>
              <span className="rounded-full bg-white/20 px-4 py-1.5 backdrop-blur">
                {report.bonusRounds} con bonificación
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <Balanza balance={report.balance} />
        </div>
        <div className="card p-6">
          <SenderoBoard position={report.position} />
        </div>
      </div>

      <div className="card p-6">
        <SectionHeader title="Cómo lideró cada quien">
          Lo que eligieron cuando les tocó decidir, frente a lo que decía su diagnóstico.
        </SectionHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {report.leaders.map((l) => (
            <LeaderCard key={l.id} leader={l} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function LeaderCard({ leader }) {
  const dom = leader.dominant ? DIMENSION_MAP[leader.dominant] : null
  const used = leader.mostUsed ? DIMENSION_MAP[leader.mostUsed] : null

  return (
    <div className="panel">
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
          style={{ background: dom?.color || '#94a3b8' }}
        >
          {leader.name?.[0]?.toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-800">{leader.name}</div>
          <div className="truncate text-xs text-slate-400">
            {leader.turnsLed} {leader.turnsLed === 1 ? 'turno liderado' : 'turnos liderados'}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Diagnóstico dice</span>
          <span className="font-semibold" style={{ color: dom?.color }}>
            {dom?.label || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">En el juego eligió</span>
          <span className="font-semibold" style={{ color: used?.color }}>
            {used?.label || '—'}
          </span>
        </div>
      </div>

      {leader.matchedDiagnostic !== null && (
        <div
          className={`chip mt-3 ${
            leader.matchedDiagnostic ? 'bg-teal-500/10 text-teal-700' : 'bg-amber-400/15 text-amber-600'
          }`}
        >
          {leader.matchedDiagnostic ? (
            <>
              <IconCheck className="h-3 w-3" /> Lideró desde su dominante
            </>
          ) : (
            <>↔ Decidió distinto a su patrón</>
          )}
        </div>
      )}
    </div>
  )
}
