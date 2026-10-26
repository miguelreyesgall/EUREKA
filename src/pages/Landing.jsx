import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import DiscBoard from '../components/DiscBoard'
import { IconArrowRight, IconCheck, IconSparkles } from '../components/icons'
import { actions } from '../lib/store'
import { DISC_STYLES, DECKS } from '../lib/discGame'
import { OWN_GAMES, PARTNER_GAMES } from '../lib/games'

const DEMO_TEAM = {
  id: 'landing',
  participants: [
    { id: 'l1', name: 'Ana Ruiz', style: 'D' },
    { id: 'l2', name: 'Beto Lara', style: 'I' },
    { id: 'l3', name: 'Cata Peña', style: 'S' },
    { id: 'l4', name: 'Dani Ortiz', style: 'C' }
  ]
}

const STEPS = [
  ['01', 'Crea la cuenta', 'Cuenta corporativa en segundos, sin instalar nada.'],
  ['02', 'Elige un juego', 'Arma los equipos y asigna las fichas DISC de cada persona.'],
  ['03', 'Juega la dinámica', 'El facilitador guía los 6 mazos desde el navegador.'],
  ['04', 'Recibe el reporte', 'Analítica grupal, individual y análisis de IA al instante.']
]

const FEATURES = [
  { icon: '🎯', title: 'Tablero digital fiel', body: 'La cruz DISC y el punto de encuentro del juego físico, ahora en pantalla y con registro automático de cada ronda.' },
  { icon: '📊', title: 'Analítica en dos niveles', body: 'Reporte grupal por equipo y drill-down individual por jugador, sin transcribir notas a mano.' },
  { icon: '✨', title: 'Análisis con IA', body: 'Interpretación automática de patrones, riesgos detectados y recomendaciones accionables para RR.HH.' },
  { icon: '👥', title: 'Historial de personas', body: 'Cada colaborador acumula su perfil DISC y su efectividad a lo largo de las sesiones.' },
  { icon: '🃏', title: 'Biblioteca de contenido', body: 'Todas las cartas y mazos disponibles para que el facilitador prepare la sesión antes.' },
  { icon: '⚡', title: 'Cero fricción', body: 'Datos ficticios con un clic para demostrar el producto completo en menos de dos minutos.' }
]

export default function Landing() {
  const navigate = useNavigate()

  const tryDemo = () => {
    actions.loadDemoData()
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/acceso" className="btn-ghost btn-sm">
              Ingresar
            </Link>
            <button onClick={tryDemo} className="btn-primary btn-sm">
              Ver demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-48 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="chip border border-brand-200 bg-white text-brand-700 shadow-sm">
              <IconSparkles className="h-3.5 w-3.5" />
              Team building medible con IA
            </span>
            <h1 className="text-balance mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-[52px]">
              El juego de mesa de equipos,{' '}
              <span className="bg-gradient-to-r from-brand-600 to-teal-500 bg-clip-text text-transparent">
                con reporte automático
              </span>
              .
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Eureka digitaliza las dinámicas presenciales que usan RR.HH. y líderes. Tu equipo juega alrededor del
              tablero, el facilitador registra desde el navegador, y al terminar recibes un informe visual con
              análisis generado por IA.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={tryDemo} className="btn-primary btn-lg">
                Probar el demo completo
                <IconArrowRight className="h-4 w-4" />
              </button>
              <Link to="/acceso" className="btn-ghost btn-lg">
                Crear cuenta de empresa
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              {['Sin instalación', 'Datos en tu navegador', 'Reporte en 1 clic'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <IconCheck className="h-3.5 w-3.5 text-teal-600" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mock visual */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="card rotate-1 p-6 shadow-float">
              <div className="flex items-center justify-between">
                <span className="chip bg-brand-50 text-brand-700">🎯 Código DISC</span>
                <span className="text-xs font-medium text-slate-400">Mazo 4 / 6 · Conflicto</span>
              </div>
              <div className="mt-4 rounded-xl bg-gradient-to-br from-slate-900 to-ink-950 p-5 text-white">
                <div className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Situación planteada</div>
                <p className="mt-2 text-sm font-semibold leading-snug">
                  “Dos integrantes llevan días sin hablarse por una decisión técnica. Medien el conflicto ahora.”
                </p>
              </div>
              <div className="mt-5 flex justify-center">
                <DiscBoard
                  team={DEMO_TEAM}
                  rounds={[{ placed: true }, { placed: true }, { placed: false }, { placed: true }]}
                  selectedIds={['l1', 'l2', 'l3']}
                  pendingCanPlace
                  size="md"
                />
              </div>
              <p className="mt-3 text-center text-xs font-medium text-teal-700">
                3 de 4 estilos participaron · ficha colocada ✓
              </p>
            </div>

            <div className="card absolute -bottom-6 -left-4 w-56 -rotate-3 p-4 shadow-float sm:-left-10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-500">
                <IconSparkles className="h-3 w-3" />
                Análisis IA
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                “El estilo Influyente aparece en el 38% de las soluciones ganadoras.”
              </p>
              <div className="mt-2.5 h-1.5 rounded-full bg-slate-100">
                <div className="h-1.5 w-[38%] rounded-full bg-gradient-to-r from-brand-500 to-teal-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-title">Producto</span>
            <h2 className="text-balance mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              De la mesa física a datos accionables
            </h2>
            <p className="mt-4 text-slate-600">
              Todo lo que antes quedaba en post-its y notas del facilitador, ahora vive en un panel.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-hover p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-50 text-xl">{f.icon}</div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-y border-slate-100 bg-slate-50/70 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-title">Flujo</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Cómo funciona</h2>
            <p className="mt-4 text-slate-600">Cuatro pasos, de la creación de la sesión al informe para RR.HH.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {STEPS.map(([n, t, d]) => (
              <div key={n}>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-sm font-extrabold text-white shadow-lift">
                  {n}
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Juego insignia */}
      <section className="relative overflow-hidden bg-ink-950 py-20 text-white">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <span className="chip bg-white/10 text-brand-200">El juego insignia</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Código DISC</h2>
            <p className="mt-5 leading-relaxed text-slate-300">
              Cada jugador recibe una ficha de identidad DISC. Los equipos enfrentan {DECKS.length} mazos de retos —
              feedback, presión, cambio, conflicto, liderazgo y comunicación— y solo colocan su ficha en el punto de
              encuentro si al menos 3 estilos participaron visiblemente en la solución.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {DISC_STYLES.map((s) => (
                <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="grid h-7 w-7 place-items-center rounded-lg text-xs font-extrabold"
                      style={{ background: s.color }}
                    >
                      {s.id}
                    </span>
                    <span className="text-sm font-bold">{s.label}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="rounded-3xl border border-white/10 bg-white p-8 shadow-float">
              <DiscBoard team={DEMO_TEAM} rounds={[{ placed: true }, { placed: true }, { placed: false }]} size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-title">Catálogo</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Nuestros productos gamificados
            </h2>
            <p className="mt-4 text-slate-600">
              Dos juegos propios que se juegan y se miden desde la plataforma, más los kits físicos que llevamos a tu
              sala en alianza con Formactiva.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {OWN_GAMES.map((g) => (
              <div key={g.id} className="card card-hover overflow-hidden">
                <div
                  className="flex h-36 items-center justify-center text-6xl"
                  style={{ background: `linear-gradient(135deg, ${g.color}1f, ${g.color}08)` }}
                >
                  {g.icon}
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: g.color }}>
                    {g.category}
                  </span>
                  <h3 className="mt-1.5 text-lg font-extrabold text-slate-900">{g.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{g.tagline}</p>
                  <span className="chip mt-3 bg-teal-500/10 text-teal-700">● Jugable en la plataforma</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
              En alianza con Formactiva · kits físicos
            </p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {PARTNER_GAMES.map((g) => (
                <div key={g.id} className="card p-4 text-center">
                  <div className="text-3xl">{g.icon}</div>
                  <h4 className="mt-2 text-xs font-bold leading-tight text-slate-800">{g.name}</h4>
                  <p className="mt-1 text-[11px] text-slate-400">{g.category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-16 text-center text-white shadow-float">
            <div className="bg-grid-dark pointer-events-none absolute inset-0" />
            <div className="relative">
              <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">¿Lo vemos funcionando?</h2>
              <p className="mx-auto mt-4 max-w-xl text-brand-100">
                Carga la empresa de ejemplo con una sesión ya jugada y su reporte con análisis de IA, o empieza de
                cero creando tu cuenta.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <button onClick={tryDemo} className="btn btn-lg bg-white text-brand-700 hover:bg-brand-50">
                  Ver demo con datos de ejemplo
                  <IconArrowRight className="h-4 w-4" />
                </button>
                <Link to="/acceso" className="btn btn-lg border border-white/30 text-white hover:bg-white/10">
                  Empezar de cero
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Logo />
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                Impulsamos personas, fortalecemos equipos y transformamos organizaciones.
              </p>
              <p className="mt-2 text-xs font-semibold text-brand-600">Innovación que transforma</p>
            </div>
            <div className="text-sm text-slate-500">
              <div className="section-title mb-2">Contacto</div>
              <p>
                <a href="mailto:gerencia@eurekafdc.online" className="hover:text-brand-600">
                  gerencia@eurekafdc.online
                </a>
              </p>
              <p className="mt-1">
                <a href="tel:+573016572297" className="hover:text-brand-600">
                  301 657 2297
                </a>
              </p>
              <p className="mt-1">
                <a href="https://www.eurekafdc.online" target="_blank" rel="noreferrer" className="hover:text-brand-600">
                  eurekafdc.online
                </a>
              </p>
            </div>
          </div>
          <p className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
            EXPERIA PLAY · demo de producto con datos simulados.
          </p>
        </div>
      </footer>
    </div>
  )
}
