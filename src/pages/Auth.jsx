import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { IconArrowRight, IconCheck, IconSparkles } from '../components/icons'
import { actions } from '../lib/store'
import { toast } from '../lib/toast'

const HIGHLIGHTS = [
  'Tablero DISC digital con registro automático por ronda',
  'Reporte grupal e individual apenas cierras la sesión',
  'Análisis generado por IA con recomendaciones para RR.HH.'
]

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('register')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setError('')
    const res =
      mode === 'register' ? actions.register(form) : actions.login({ email: form.email, password: form.password })
    if (res.error) return setError(res.error)
    toast.success(mode === 'register' ? '¡Cuenta creada! Bienvenido a Eureka' : 'Sesión iniciada')
    navigate('/app')
  }

  const loadDemo = () => {
    actions.loadDemoData()
    toast.success('Datos de ejemplo cargados')
    navigate('/app')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Panel visual */}
      <div className="relative hidden overflow-hidden bg-ink-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />

        <Link to="/" className="relative">
          <Logo className="text-white" />
        </Link>

        <div className="relative">
          <span className="chip bg-white/10 text-brand-200">
            <IconSparkles className="h-3.5 w-3.5" />
            Team building medible
          </span>
          <h2 className="text-balance mt-5 text-[34px] font-extrabold leading-tight tracking-tight">
            Convierte una dinámica de equipo en datos accionables.
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-slate-400">
            Crea la sesión, arma los equipos y deja que Eureka construya el reporte de fortalezas, brechas y
            recomendaciones por ti.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-500/20 text-teal-400">
                  <IconCheck className="h-3 w-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-sm font-semibold">¿Solo quieres mirar?</div>
          <p className="mt-1 text-sm text-slate-400">
            Carga una empresa de ejemplo con una sesión jugada y su reporte completo.
          </p>
          <button onClick={loadDemo} className="btn-teal btn-sm mt-3">
            Entrar con datos de ejemplo
            <IconArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <div className="mt-8 lg:mt-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {mode === 'register' ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {mode === 'register'
                ? 'Empieza a medir tus dinámicas de equipo hoy mismo.'
                : 'Ingresa para ver tus sesiones y reportes.'}
            </p>
          </div>

          <div className="mt-6 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            <button
              onClick={() => setMode('register')}
              className={`flex-1 rounded-lg py-2 transition ${
                mode === 'register' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Crear cuenta
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 rounded-lg py-2 transition ${
                mode === 'login' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Ingresar
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Nombre de la empresa</label>
                <input className="input" value={form.name} onChange={set('name')} placeholder="Nova Labs" required />
              </div>
            )}
            <div>
              <label className="label">Correo corporativo</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="rrhh@empresa.com"
                required
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-coral-400/30 bg-coral-500/5 px-3.5 py-2.5 text-sm font-medium text-coral-600">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              {mode === 'register' ? 'Crear cuenta de empresa' : 'Ingresar'}
              <IconArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            Autenticación simulada para el demo. Nada se envía a un servidor.
          </p>
          <button
            onClick={loadDemo}
            className="mt-3 w-full text-center text-sm font-semibold text-brand-600 transition hover:text-brand-700 lg:hidden"
          >
            O entrar con datos de ejemplo →
          </button>
        </div>
      </div>
    </div>
  )
}
