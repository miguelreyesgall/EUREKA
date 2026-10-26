import { Link } from 'react-router-dom'
import { ProgressBar, SectionHeader } from './ui'
import { DIMENSION_MAP } from '../lib/diagnostic'
import { DISC_PROFILE_MAP } from '../lib/discDiagnostic'
import { sessionPeople } from '../lib/sessions'
import { toast } from '../lib/toast'

// Estado de la encuesta previa de una sesión: quién ya respondió (con su
// perfil) y quién no (con su enlace individual). Sirve a los dos juegos.

export default function DiagnosticRoster({ session }) {
  const isDisc = session.gameId === 'codigo-disc'
  const profiles = isDisc ? DISC_PROFILE_MAP : DIMENSION_MAP
  const people = sessionPeople(session)
  const answered = people.filter((p) => p.diagnostic)
  const pending = people.length - answered.length

  return (
    <div className="card p-6">
      <SectionHeader title="Encuesta previa">
        {isDisc
          ? `Define la ficha de identidad de cada jugador. ${answered.length} de ${people.length} respondieron.`
          : `Define desde dónde arranca la Balanza. ${answered.length} de ${people.length} respondieron.`}
      </SectionHeader>
      <ProgressBar value={answered.length} max={people.length} />

      <div className="mt-4 divide-y divide-slate-100">
        {people.map((p) => {
          const d = p.diagnostic
          const dom = d ? profiles[d.dominant] : null
          const weak = d ? profiles[d.weakest] : null
          const url = `${window.location.origin}/diagnostico/${session.id}/${p.id}`

          return (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                  style={{ background: dom?.color || '#cbd5e1' }}
                >
                  {dom ? (isDisc ? dom.id : dom.label[0]) : '?'}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-800">{p.name}</div>
                  <div className="truncate text-xs text-slate-400">{p.role}</div>
                </div>
              </div>

              {d ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip" style={{ background: `${dom.color}18`, color: dom.color }}>
                    {isDisc ? `Ficha ${dom.id} · ${dom.label}` : `Domina ${dom.label}`}
                  </span>
                  <span className="chip bg-slate-100 text-slate-500">Más débil: {weak.label}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="chip bg-amber-400/15 text-amber-600">Pendiente</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(url)
                      toast.success(`Enlace de ${p.name.split(' ')[0]} copiado`)
                    }}
                    className="btn-ghost btn-sm"
                  >
                    Copiar enlace
                  </button>
                  <Link to={`/diagnostico/${session.id}/${p.id}`} className="btn-primary btn-sm">
                    Responder
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {pending > 0 && (
        <p className="mt-4 text-xs text-amber-600">
          ⚠️ Puedes iniciar igual:{' '}
          {isDisc
            ? 'quienes no respondieron conservan la ficha que les hayas asignado a mano.'
            : 'quienes no respondieron arrancan en el centro de la Balanza (4-4-4).'}
        </p>
      )}
    </div>
  )
}
