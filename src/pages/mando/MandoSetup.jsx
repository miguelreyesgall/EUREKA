import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, SectionHeader } from '../../components/ui'
import { IconPlus } from '../../components/icons'
import { actions } from '../../lib/store'
import { generateFictionalLeaders, randomPurpose, randomSessionName } from '../../lib/fakeData'
import { DIAGNOSTIC_MINUTES } from '../../lib/diagnostic'
import { PATH_LENGTH } from '../../lib/mandoIntegro'

const emptyLeader = () => ({ name: '', role: '' })

export default function MandoSetup({ game }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [leaders, setLeaders] = useState([emptyLeader(), emptyLeader(), emptyLeader(), emptyLeader()])
  const [error, setError] = useState('')

  const setLeader = (i, key, value) =>
    setLeaders((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)))
  const addLeader = () => setLeaders((ls) => [...ls, emptyLeader()])
  const removeLeader = (i) => setLeaders((ls) => ls.filter((_, idx) => idx !== i))

  const fillFictitious = () => {
    if (!name.trim()) setName(randomSessionName())
    if (!purpose.trim()) setPurpose(randomPurpose())
    setLeaders(generateFictionalLeaders(Math.max(leaders.length, 4)))
  }

  const valid = leaders.filter((l) => l.name.trim())

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Ponle nombre a la sesión.')
    if (valid.length < 3) return setError('Mando Íntegro necesita al menos 3 líderes para que el turno rote.')
    const session = actions.createMandoSession({ name: name.trim(), purpose: purpose.trim(), participants: valid })
    navigate(`/app/sesion/${session.id}`)
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Juegos', to: '/app/juegos' },
          { label: game.name, to: `/app/juegos/${game.id}` },
          { label: 'Nueva sesión' }
        ]}
        title="Nueva sesión"
        description="Agrega a los líderes que van a participar. Cada uno responderá su diagnóstico previo antes de jugar."
        actions={
          <button type="button" onClick={fillFictitious} className="btn-ghost btn-sm">
            🎲 Rellenar con datos ficticios
          </button>
        }
      />

      <form onSubmit={submit} className="space-y-6">
        <div className="card p-6">
          <SectionHeader title="Datos de la sesión" />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Nombre de la sesión</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Comité de líderes · Cumbre de liderazgo"
              />
            </div>
            <div>
              <label className="label">Objetivo (opcional)</label>
              <input
                className="input"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="¿Qué quieres observar de estos líderes?"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="section-title">Líderes participantes ({valid.length})</h2>
          <button type="button" onClick={addLeader} className="btn-ghost btn-sm">
            <IconPlus className="h-3.5 w-3.5" />
            Agregar líder
          </button>
        </div>

        <div className="card divide-y divide-slate-100">
          {leaders.map((l, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 p-4 sm:flex-nowrap">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                {i + 1}
              </span>
              <input
                className="input flex-1"
                value={l.name}
                onChange={(e) => setLeader(i, 'name', e.target.value)}
                placeholder={`Líder ${i + 1}`}
              />
              <input
                className="input flex-1"
                value={l.role}
                onChange={(e) => setLeader(i, 'role', e.target.value)}
                placeholder="Cargo"
              />
              <button
                type="button"
                onClick={() => removeLeader(i)}
                disabled={leaders.length <= 3}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-400 transition hover:text-coral-500 disabled:opacity-30"
                aria-label="Quitar líder"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="card border-sky-200 bg-sky-50/50 p-5">
          <h3 className="text-sm font-bold text-slate-800">Qué pasa después de crear la sesión</h3>
          <ol className="mt-2 space-y-1.5 text-sm text-slate-600">
            <li>
              <b>1.</b> Cada líder recibe su enlace del <b>diagnóstico previo</b> ({DIAGNOSTIC_MINUTES.min}-
              {DIAGNOSTIC_MINUTES.max} min) y descubre su dimensión dominante y la más débil.
            </li>
            <li>
              <b>2.</b> La <b>Balanza</b> del equipo arranca en el promedio de esos diagnósticos, no en cero.
            </li>
            <li>
              <b>3.</b> Juegan el sendero de {PATH_LENGTH} casillas con el rol de Líder de turno rotando.
            </li>
          </ol>
        </div>

        <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
          {error ? (
            <p className="text-sm font-semibold text-coral-600">{error}</p>
          ) : (
            <p className="text-sm text-slate-500">{valid.length} líderes listos para el ascenso</p>
          )}
          <button type="submit" className="btn-primary shrink-0">
            Crear sesión y enviar diagnósticos →
          </button>
        </div>
      </form>
    </>
  )
}
