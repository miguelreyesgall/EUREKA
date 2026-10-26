import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { PageHeader, ProgressBar, SectionHeader } from '../components/ui'
import { IconCheck } from '../components/icons'
import { actions, useCompanySessions, useCurrentCompany } from '../lib/store'
import { GAMES } from '../lib/games'
import { sessionComposition, sessionPeople } from '../lib/sessions'
import { toast } from '../lib/toast'

const PLAN_FEATURES = [
  'Sesiones ilimitadas de Código DISC',
  'Reportes grupales e individuales',
  'Análisis generado por IA en cada sesión',
  'Directorio de personas con historial DISC'
]

export default function Settings() {
  const company = useCurrentCompany()
  const sessions = useCompanySessions()
  const navigate = useNavigate()

  const seatsUsed = new Set(
    sessions.flatMap((s) => sessionPeople(s).map((p) => p.name.trim().toLowerCase()))
  ).size
  const activeGames = GAMES.filter((g) => g.status === 'available').length

  const fmt = (d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <AppShell>
      <PageHeader title="Configuración" description="Datos de la cuenta, plan de uso y opciones de la demo." />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Perfil */}
        <div className="card p-6">
          <SectionHeader title="Perfil de la empresa" />
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white">
              {company?.name?.[0]?.toUpperCase() || '·'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-slate-900">{company?.name}</div>
              <div className="truncate text-sm text-slate-500">{company?.email}</div>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <div>
              <label className="label">Nombre de la empresa</label>
              <input className="input" value={company?.name || ''} disabled />
            </div>
            <div>
              <label className="label">Correo corporativo</label>
              <input className="input" value={company?.email || ''} disabled />
            </div>
            <p className="text-xs text-slate-400">
              Cuenta creada el {company ? fmt(company.createdAt) : '—'}. La edición está deshabilitada en el demo.
            </p>
          </div>
        </div>

        {/* Plan */}
        <div className="card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-4 text-white">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-brand-200">Plan actual</div>
              <div className="text-lg font-extrabold">Growth</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold">$0</div>
              <div className="text-[11px] text-brand-200">demo interno</div>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <div className="space-y-4">
              <Usage label="Sesiones este mes" value={sessions.length} max={20} />
              <Usage label="Personas activas" value={seatsUsed} max={50} />
              <Usage label="Juegos habilitados" value={activeGames} max={GAMES.length} />
            </div>
            <ul className="mt-5 space-y-2">
              {PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                  <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                  {f}
                </li>
              ))}
            </ul>
            <button disabled className="btn-primary mt-auto w-full opacity-60">
              Actualizar plan (próximamente)
            </button>
          </div>
        </div>
      </div>

      {/* Zona de peligro */}
      <div className="card mt-4 border-coral-400/25 p-6">
        <SectionHeader title="Zona de peligro" />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-coral-500/5 p-4">
          <div>
            <div className="text-sm font-semibold text-slate-800">Reiniciar datos de la demo</div>
            <p className="mt-0.5 text-xs text-slate-500">
              Borra empresas, sesiones y reportes guardados en este navegador. No se puede deshacer.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('Esto borra todos los datos locales de la demo. ¿Continuar?')) {
                actions.reset()
                toast.success('Demo reiniciada')
                navigate('/')
              }
            }}
            className="btn-danger btn-sm"
          >
            Reiniciar demo
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Configuración simulada para el demo · los datos viven solo en este navegador.
      </p>
    </AppShell>
  )
}

function Usage({ label, value, max }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-400">
          {value} <span className="text-slate-300">/ {max}</span>
        </span>
      </div>
      <ProgressBar className="mt-1.5" value={value} max={max} />
    </div>
  )
}
