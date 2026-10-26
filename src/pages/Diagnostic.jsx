import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Logo from '../components/Logo'
import { ProgressBar } from '../components/ui'
import { IconArrowRight, IconCheck } from '../components/icons'
import { actions, useSession } from '../lib/store'
import {
  DIAGNOSTIC_MINUTES,
  DIAGNOSTIC_ROWS,
  DIMENSIONS,
  DIMENSION_IDS,
  DIMENSION_MAP,
  isDiagnosticComplete,
  scoreDiagnostic,
  startingBalanceFor
} from '../lib/diagnostic'

// Diagnóstico previo de Mando Íntegro. Es una página pública: cada líder entra
// con su propio enlace, sin cuenta de empresa.

export default function Diagnostic() {
  const { sessionId, participantId } = useParams()
  const session = useSession(sessionId)
  const participant = session?.participants?.find((p) => p.id === participantId)

  const [answers, setAnswers] = useState(() => participant?.diagnostic?.answers || {})
  const [sent, setSent] = useState(() => !!participant?.diagnostic)

  const complete = isDiagnosticComplete(answers)
  const answered = DIAGNOSTIC_ROWS.filter((_, i) => answers[i]?.most && answers[i]?.least).length
  const result = useMemo(() => (sent ? participant?.diagnostic || scoreDiagnostic(answers) : null), [sent, participant, answers])

  if (!session || !participant) {
    return (
      <Shell>
        <div className="card p-10 text-center">
          <div className="text-4xl">🔍</div>
          <h1 className="mt-3 text-xl font-extrabold">Enlace no válido</h1>
          <p className="mt-2 text-sm text-slate-500">
            Este diagnóstico no existe o la sesión fue eliminada. Pídele el enlace a quien facilita la sesión.
          </p>
        </div>
      </Shell>
    )
  }

  const pick = (rowIndex, kind, dimId) =>
    setAnswers((a) => {
      const row = { ...(a[rowIndex] || {}) }
      const other = kind === 'most' ? 'least' : 'most'
      row[kind] = row[kind] === dimId ? undefined : dimId
      // No se puede marcar la misma palabra como la que más y la que menos.
      if (row[other] === dimId) row[other] = undefined
      return { ...a, [rowIndex]: row }
    })

  const submit = () => {
    actions.saveDiagnostic(sessionId, participantId, answers)
    setSent(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (sent && result) return <Results participant={participant} result={result} session={session} />

  return (
    <Shell>
      <div className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-sky-700 via-sky-600 to-blue-700 p-7 text-white">
          <div className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div className="relative">
            <span className="chip bg-white/15 text-white backdrop-blur">👑 Mando Íntegro</span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Diagnóstico previo</h1>
            <p className="mt-1.5 text-sm text-sky-100">
              Hola {participant.name.split(' ')[0]}. Toma entre {DIAGNOSTIC_MINUTES.min} y {DIAGNOSTIC_MINUTES.max}{' '}
              minutos y define desde dónde arranca tu Balanza en el juego.
            </p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-slate-600">
            No hay respuestas correctas o incorrectas — responde pensando en <b>cómo lideras normalmente</b>, no en
            cómo te gustaría liderar. En cada fila marca la palabra que <b className="text-teal-700">MÁS</b> te
            representa y la que <b className="text-coral-600">MENOS</b>. La tercera queda sin marcar.
          </p>
        </div>
      </div>

      {/* Progreso pegado arriba */}
      <div className="sticky top-0 z-20 -mx-4 mt-5 border-y border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex items-center gap-3">
          <ProgressBar value={answered} max={DIAGNOSTIC_ROWS.length} />
          <span className="tabular shrink-0 text-xs font-bold text-slate-500">
            {answered}/{DIAGNOSTIC_ROWS.length}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {DIAGNOSTIC_ROWS.map((row, i) => {
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

              <div className="grid gap-2 sm:grid-cols-3">
                {row.map((word, c) => {
                  const dimId = DIMENSION_IDS[c]
                  const isMost = a.most === dimId
                  const isLeast = a.least === dimId
                  return (
                    <div
                      key={dimId}
                      className={`rounded-xl border-2 p-2.5 transition ${
                        isMost
                          ? 'border-teal-400 bg-teal-50'
                          : isLeast
                            ? 'border-coral-300 bg-coral-500/5'
                            : 'border-slate-150 bg-white'
                      }`}
                      style={{ borderColor: isMost ? '#2dd4bf' : isLeast ? '#fb7185' : '#e2e8f0' }}
                    >
                      <div className="text-center text-sm font-semibold text-slate-800">{word}</div>
                      <div className="mt-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => pick(i, 'most', dimId)}
                          className={`flex-1 rounded-lg py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                            isMost ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Más
                        </button>
                        <button
                          type="button"
                          onClick={() => pick(i, 'least', dimId)}
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
          {complete ? '¡Listo! Ya puedes enviar tu diagnóstico.' : `Te faltan ${DIAGNOSTIC_ROWS.length - answered} filas.`}
        </p>
        <button onClick={submit} disabled={!complete} className="btn-primary shrink-0">
          Ver mi resultado
          <IconArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Shell>
  )
}

function Results({ participant, result, session }) {
  const dom = DIMENSION_MAP[result.dominant]
  const weak = DIMENSION_MAP[result.weakest]
  const start = startingBalanceFor(result)

  return (
    <Shell>
      <div className="card overflow-hidden">
        <div className="relative p-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${dom.color}, ${dom.color}bb)` }}>
          <div className="bg-grid-dark pointer-events-none absolute inset-0" />
          <div className="relative">
            <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/75">Tu dimensión dominante</div>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{dom.label}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/85">{dom.desc}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {DIMENSIONS.map((d) => {
              const net = result.net[d.id]
              const isDom = d.id === result.dominant
              const isWeak = d.id === result.weakest
              return (
                <div
                  key={d.id}
                  className="rounded-xl border-2 p-4"
                  style={{ borderColor: isDom ? d.color : '#e2e8f0', background: isDom ? `${d.color}0d` : '#fff' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold" style={{ color: d.color }}>
                      {d.label}
                    </span>
                    <span className="tabular text-sm font-bold text-slate-500">
                      {net > 0 ? `+${net}` : net}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{d.short}</p>
                  {isDom && <span className="chip mt-2 bg-teal-500/10 text-teal-700">Dominante</span>}
                  {isWeak && <span className="chip mt-2 bg-amber-400/15 text-amber-600">Más débil</span>}
                </div>
              )
            })}
          </div>

          <div className="panel mt-5">
            <h3 className="text-sm font-bold text-slate-800">Tu riesgo como líder {dom.label}</h3>
            <p className="mt-1.5 text-sm text-slate-600">{dom.risk}</p>
          </div>

          <div className="panel mt-3">
            <h3 className="text-sm font-bold text-slate-800">Tu Balanza arranca así</h3>
            <p className="mt-1.5 text-sm text-slate-600">
              En la sesión <b>{session.name}</b> tu Balanza no empieza en cero: arranca en{' '}
              <b>
                {start.cabeza}-{start.corazon}-{start.manos}
              </b>{' '}
              (Cabeza-Corazón-Manos), reflejando tu patrón real. El reto del juego será emparejarla.
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
