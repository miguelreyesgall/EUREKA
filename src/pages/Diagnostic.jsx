import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Logo from '../components/Logo'
import { ProgressBar } from '../components/ui'
import { IconArrowRight, IconCheck } from '../components/icons'
import { actions, useSession } from '../lib/store'
import { sessionPeople } from '../lib/sessions'
import {
  DIAGNOSTIC_MINUTES,
  DIAGNOSTIC_ROWS,
  DIMENSIONS,
  DIMENSION_IDS,
  isDiagnosticComplete,
  scoreDiagnostic,
  startingBalanceFor
} from '../lib/diagnostic'
import {
  DISC_DIAG_ROWS,
  DISC_PROFILES,
  DISC_PROFILE_IDS,
  isDiscDiagnosticComplete,
  scoreDiscDiagnostic
} from '../lib/discDiagnostic'

// Encuesta previa: la responde cada jugador con su propio enlace, sin cuenta.
// El contenido cambia según el juego, la mecánica (MÁS / MENOS) es la misma.

const CONFIG = {
  'mando-integro': {
    game: '👑 Mando Íntegro',
    rows: DIAGNOSTIC_ROWS,
    options: DIMENSIONS,
    ids: DIMENSION_IDS,
    isComplete: isDiagnosticComplete,
    score: scoreDiagnostic,
    resultLabel: 'Tu dimensión dominante',
    gradient: 'from-sky-700 via-sky-600 to-blue-700'
  },
  'codigo-disc': {
    game: '🎯 Código DISC',
    rows: DISC_DIAG_ROWS,
    options: DISC_PROFILES,
    ids: DISC_PROFILE_IDS,
    isComplete: isDiscDiagnosticComplete,
    score: scoreDiscDiagnostic,
    resultLabel: 'Tu ficha de identidad',
    gradient: 'from-brand-700 via-brand-600 to-indigo-700'
  }
}

export default function Diagnostic() {
  const { sessionId, participantId } = useParams()
  const session = useSession(sessionId)
  const participant = sessionPeople(session || {}).find((p) => p.id === participantId)
  const cfg = CONFIG[session?.gameId] || CONFIG['mando-integro']

  const [answers, setAnswers] = useState(() => participant?.diagnostic?.answers || {})
  const [sent, setSent] = useState(() => !!participant?.diagnostic)

  const complete = cfg.isComplete(answers)
  const answered = cfg.rows.filter((_, i) => answers[i]?.most && answers[i]?.least).length
  const result = useMemo(
    () => (sent ? participant?.diagnostic || cfg.score(answers) : null),
    [sent, participant, answers, cfg]
  )

  if (!session || !participant) {
    return (
      <Shell>
        <div className="card p-10 text-center">
          <div className="text-4xl">🔍</div>
          <h1 className="mt-3 text-xl font-extrabold">Enlace no válido</h1>
          <p className="mt-2 text-sm text-slate-500">
            Esta encuesta no existe o la sesión fue eliminada. Pídele el enlace a quien facilita la sesión.
          </p>
        </div>
      </Shell>
    )
  }

  const pick = (rowIndex, kind, optId) =>
    setAnswers((a) => {
      const row = { ...(a[rowIndex] || {}) }
      const other = kind === 'most' ? 'least' : 'most'
      row[kind] = row[kind] === optId ? undefined : optId
      // No se puede marcar la misma palabra como la que más y la que menos.
      if (row[other] === optId) row[other] = undefined
      return { ...a, [rowIndex]: row }
    })

  const submit = () => {
    actions.saveDiagnostic(sessionId, participantId, answers)
    setSent(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (sent && result) return <Results participant={participant} result={result} session={session} cfg={cfg} />

  const cols = cfg.options.length

  return (
    <Shell>
      <div className="card overflow-hidden">
        <div className={`relative bg-gradient-to-br ${cfg.gradient} p-7 text-white`}>
          <div className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div className="relative">
            <span className="chip bg-white/15 text-white backdrop-blur">{cfg.game}</span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Encuesta previa</h1>
            <p className="mt-1.5 text-sm text-white/85">
              Hola {participant.name.split(' ')[0]}. Toma entre {DIAGNOSTIC_MINUTES.min} y {DIAGNOSTIC_MINUTES.max}{' '}
              minutos y define tu perfil para la sesión.
            </p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-slate-600">
            No hay respuestas correctas o incorrectas — responde pensando en <b>cómo eres normalmente</b>, no en cómo
            te gustaría ser. En cada fila marca la palabra que <b className="text-teal-700">MÁS</b> te representa y la
            que <b className="text-coral-600">MENOS</b>. Las demás quedan sin marcar.
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-20 -mx-4 mt-5 border-y border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex items-center gap-3">
          <ProgressBar value={answered} max={cfg.rows.length} />
          <span className="tabular shrink-0 text-xs font-bold text-slate-500">
            {answered}/{cfg.rows.length}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {cfg.rows.map((row, i) => {
          const a = answers[i] || {}
          const done = a.most && a.least
          return (
            <div key={i} className={`card p-4 transition ${done ? 'border-teal-200' : ''}`}>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                  {i + 1}
                </span>
                {done && <IconCheck className="h-3.5 w-3.5 text-teal-600" />}
              </div>

              <div className={`grid gap-2 ${cols === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
                {row.map((word, c) => {
                  const optId = cfg.ids[c]
                  const isMost = a.most === optId
                  const isLeast = a.least === optId
                  return (
                    <div
                      key={optId}
                      className="rounded-xl border-2 p-2.5 transition"
                      style={{ borderColor: isMost ? '#2dd4bf' : isLeast ? '#fb7185' : '#e2e8f0' }}
                    >
                      <div className="text-center text-sm font-semibold text-slate-800">{word}</div>
                      <div className="mt-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => pick(i, 'most', optId)}
                          className={`flex-1 rounded-lg py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                            isMost ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Más
                        </button>
                        <button
                          type="button"
                          onClick={() => pick(i, 'least', optId)}
                          className={`flex-1 rounded-lg py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                            isLeast ? 'bg-coral-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Menos
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="card mt-5 flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="text-sm text-slate-500">
          {complete ? '¡Listo! Ya puedes enviar tu encuesta.' : `Te faltan ${cfg.rows.length - answered} filas.`}
        </p>
        <button onClick={submit} disabled={!complete} className="btn-primary shrink-0">
          Ver mi resultado
          <IconArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Shell>
  )
}

function Results({ participant, result, session, cfg }) {
  const byId = Object.fromEntries(cfg.options.map((o) => [o.id, o]))
  const dom = byId[result.dominant]
  const weak = byId[result.weakest]
  const isMando = session.gameId === 'mando-integro'
  const start = isMando ? startingBalanceFor(result) : null

  return (
    <Shell>
      <div className="card overflow-hidden">
        <div
          className="relative p-8 text-center text-white"
          style={{ background: `linear-gradient(135deg, ${dom.color}, ${dom.color}bb)` }}
        >
          <div className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div className="relative">
            <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/75">{cfg.resultLabel}</div>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{dom.label}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/85">{dom.desc}</p>
          </div>
        </div>

        <div className="p-6">
          <div className={`grid gap-3 ${cfg.options.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
            {cfg.options.map((o) => {
              const net = result.net[o.id]
              const isDom = o.id === result.dominant
              const isWeak = o.id === result.weakest
              return (
                <div
                  key={o.id}
                  className="rounded-xl border-2 p-4"
                  style={{ borderColor: isDom ? o.color : '#e2e8f0', background: isDom ? `${o.color}0d` : '#fff' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold" style={{ color: o.color }}>
                      {o.label}
                    </span>
                    <span className="tabular text-sm font-bold text-slate-500">{net > 0 ? `+${net}` : net}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{o.short}</p>
                  {isDom && <span className="chip mt-2 bg-teal-500/10 text-teal-700">Dominante</span>}
                  {isWeak && <span className="chip mt-2 bg-amber-400/15 text-amber-600">Más débil</span>}
                </div>
              )
            })}
          </div>

          <div className="panel mt-5">
            <h3 className="text-sm font-bold text-slate-800">Tu riesgo como perfil {dom.label}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{dom.risk}</p>
          </div>

          <div className="panel mt-3">
            <h3 className="text-sm font-bold text-slate-800">
              {isMando ? 'Tu Balanza arranca así' : 'Con qué ficha vas a jugar'}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              {isMando ? (
                <>
                  En la sesión <b>{session.name}</b> tu Balanza no empieza en cero: arranca en{' '}
                  <b>
                    {start.cabeza}-{start.corazon}-{start.manos}
                  </b>{' '}
                  (Cabeza-Corazón-Manos), reflejando tu patrón real. El reto será emparejarla.
                </>
              ) : (
                <>
                  En la sesión <b>{session.name}</b> vas a jugar con la ficha{' '}
                  <b style={{ color: dom.color }}>
                    {dom.id} · {dom.label}
                  </b>
                  . Tu equipo solo coloca su ficha en el punto de encuentro cuando al menos 3 estilos distintos
                  participan en la solución — el tuyo es uno de ellos.
                </>
              )}
            </p>
          </div>

          <p className="mt-5 text-center text-xs text-slate-400">
            Gracias {participant.name.split(' ')[0]}. Ya puedes cerrar esta página: tu facilitador verá tu resultado.
          </p>
        </div>
      </div>
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <Link to="/">
            <Logo />
          </Link>
          <span className="text-xs font-semibold text-slate-400">Innovación que transforma</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-8">{children}</main>
    </div>
  )
}
