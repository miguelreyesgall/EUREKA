import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { EmptyState, PageHeader, SectionHeader } from '../components/ui'
import { IconPlus } from '../components/icons'
import { actions } from '../lib/store'
import { DISC_STYLES, MIN_STYLES_TO_PLACE } from '../lib/discGame'
import { GAME_MAP } from '../lib/games'
import { generateFictionalMembers, randomPurpose, randomSessionName } from '../lib/fakeData'
import { toast } from '../lib/toast'

const emptyParticipant = () => ({ name: '', role: '', style: '' })

export default function SessionSetup() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const game = GAME_MAP[gameId]

  const [name, setName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [teams, setTeams] = useState([
    { name: 'Equipo 1', participants: [emptyParticipant(), emptyParticipant()] },
    { name: 'Equipo 2', participants: [emptyParticipant(), emptyParticipant()] }
  ])
  const [error, setError] = useState('')

  if (!game || game.status !== 'available') {
    return (
      <AppShell>
        <EmptyState
          emoji="🔒"
          title="Juego no disponible"
          description="Este juego todavía no permite crear sesiones."
          action={
            <button onClick={() => navigate('/app/juegos')} className="btn-primary">
              Volver al marketplace
            </button>
          }
        />
      </AppShell>
    )
  }

  const setTeamName = (ti, value) =>
    setTeams((ts) => ts.map((t, i) => (i === ti ? { ...t, name: value } : t)))

  const setParticipant = (ti, pi, key, value) =>
    setTeams((ts) =>
      ts.map((t, i) =>
        i === ti
          ? { ...t, participants: t.participants.map((p, j) => (j === pi ? { ...p, [key]: value } : p)) }
          : t
      )
    )

  const addParticipant = (ti) =>
    setTeams((ts) => ts.map((t, i) => (i === ti ? { ...t, participants: [...t.participants, emptyParticipant()] } : t)))

  const removeParticipant = (ti, pi) =>
    setTeams((ts) =>
      ts.map((t, i) => (i === ti ? { ...t, participants: t.participants.filter((_, j) => j !== pi) } : t))
    )

  const addTeam = () => setTeams((ts) => [...ts, { name: `Equipo ${ts.length + 1}`, participants: [emptyParticipant(), emptyParticipant()] }])
  const removeTeam = (ti) => setTeams((ts) => ts.filter((_, i) => i !== ti))

  const fillTeamFictitious = (ti) =>
    setTeams((ts) =>
      ts.map((t, i) => (i === ti ? { ...t, participants: generateFictionalMembers(Math.max(t.participants.length, 4)) } : t))
    )

  const fillEverythingFictitious = () => {
    if (!name.trim()) setName(randomSessionName())
    if (!purpose.trim()) setPurpose(randomPurpose())
    setTeams((ts) => ts.map((t) => ({ ...t, participants: generateFictionalMembers(Math.max(t.participants.length, 4)) })))
  }

  const validTeams = teams
    .map((t) => ({ ...t, participants: t.participants.filter((p) => p.name.trim()) }))
    .filter((t) => t.name.trim() && t.participants.length >= 2)

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Ponle nombre a la sesión.')
    if (validTeams.length < 2) return setError('Necesitas al menos 2 equipos con 2 o más participantes cada uno.')
    const session = actions.createDiscSession({ name: name.trim(), purpose: purpose.trim(), teams: validTeams })
    toast.success(`Sesión “${session.name}” creada con ${validTeams.length} equipos`)
    navigate(`/app/sesion/${session.id}`)
  }

  const styleCount = (participants) => new Set(participants.filter((p) => p.style).map((p) => p.style)).size

  return (
    <AppShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Juegos', to: '/app/juegos' },
          { label: game.name, to: `/app/juegos/${gameId}` },
          { label: 'Nueva sesión' }
        ]}
        title="Nueva sesión"
        description="Arma los equipos, agrega a las personas y asígnales su ficha de estilo DISC."
        actions={
          <button type="button" onClick={fillEverythingFictitious} className="btn-ghost btn-sm">
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
                placeholder="Retro trimestral · Squad Producto"
              />
            </div>
            <div>
              <label className="label">Objetivo (opcional)</label>
              <input
                className="input"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="¿Qué quieres trabajar con este grupo?"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="section-title">Equipos ({teams.length})</h2>
          <button type="button" onClick={addTeam} className="btn-ghost btn-sm">
            <IconPlus className="h-3.5 w-3.5" />
            Agregar equipo
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {teams.map((team, ti) => {
            const covered = styleCount(team.participants)
            return (
              <div key={ti} className="card p-5">
                <div className="flex items-center gap-2">
                  <input
                    className="input flex-1 font-semibold"
                    value={team.name}
                    onChange={(e) => setTeamName(ti, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => fillTeamFictitious(ti)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-base transition hover:border-brand-300 hover:bg-brand-50"
                    title="Rellenar este equipo con nombres ficticios"
                  >
                    🎲
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTeam(ti)}
                    disabled={teams.length <= 2}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:text-coral-500 disabled:opacity-30"
                    aria-label="Quitar equipo"
                  >
                    ×
                  </button>
                </div>

                {covered < MIN_STYLES_TO_PLACE && (
                  <p className="mt-2 text-xs text-amber-600">
                    ⚠️ Este equipo tiene {covered} estilo(s) DISC distinto(s). Necesita al menos{' '}
                    {MIN_STYLES_TO_PLACE} para poder colocar fichas.
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  {team.participants.map((p, pi) => (
                    <div key={pi} className="flex flex-wrap gap-2 sm:flex-nowrap">
                      <input
                        className="input flex-1"
                        value={p.name}
                        onChange={(e) => setParticipant(ti, pi, 'name', e.target.value)}
                        placeholder={`Participante ${pi + 1}`}
                      />
                      <input
                        className="input flex-1"
                        value={p.role}
                        onChange={(e) => setParticipant(ti, pi, 'role', e.target.value)}
                        placeholder="Rol"
                      />
                      <select
                        className="input w-full sm:w-36"
                        value={p.style}
                        onChange={(e) => setParticipant(ti, pi, 'style', e.target.value)}
                      >
                        <option value="">Estilo…</option>
                        {DISC_STYLES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.id} · {s.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeParticipant(ti, pi)}
                        disabled={team.participants.length <= 1}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:text-coral-500 disabled:opacity-30"
                        aria-label="Quitar"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addParticipant(ti)}
                  className="mt-3 w-full rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-600"
                >
                  + Agregar participante
                </button>
              </div>
            )
          })}
        </div>

        <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            {error ? (
              <p className="text-sm font-semibold text-coral-600">{error}</p>
            ) : (
              <p className="text-sm text-slate-500">
                {validTeams.length} equipos listos ·{' '}
                {validTeams.reduce((n, t) => n + t.participants.length, 0)} participantes
              </p>
            )}
          </div>
          <button type="submit" className="btn-primary shrink-0">
            Crear sesión y abrir sala →
          </button>
        </div>
      </form>
    </AppShell>
  )
}
