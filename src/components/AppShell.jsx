import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import Toaster from './Toaster'
import CommandPalette from './CommandPalette'
import { actions, useCurrentCompany } from '../lib/store'
import {
  IconCards,
  IconChart,
  IconClose,
  IconGrid,
  IconHome,
  IconLayers,
  IconLogout,
  IconMenu,
  IconPlus,
  IconSearch,
  IconSettings,
  IconUsers
} from './icons'

const NAV_SECTIONS = [
  {
    title: 'Principal',
    items: [
      { to: '/app', end: true, label: 'Panel', Icon: IconHome },
      { to: '/app/sesiones', label: 'Sesiones', Icon: IconLayers },
      { to: '/app/juegos', label: 'Juegos', Icon: IconGrid }
    ]
  },
  {
    title: 'Equipo',
    items: [
      { to: '/app/personas', label: 'Personas', Icon: IconUsers },
      { to: '/app/analitica', label: 'Analítica', Icon: IconChart }
    ]
  },
  {
    title: 'Recursos',
    items: [{ to: '/app/biblioteca', label: 'Biblioteca', Icon: IconCards }]
  },
  {
    title: 'Cuenta',
    items: [{ to: '/app/configuracion', label: 'Configuración', Icon: IconSettings }]
  }
]

export default function AppShell({ children }) {
  const company = useCurrentCompany()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ink-950 bg-grid-dark text-white lg:flex">
        <SidebarContent company={company} navigate={navigate} />
      </aside>

      {/* Sidebar (movil) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 animate-slide-in-left flex-col bg-ink-950 bg-grid-dark text-white shadow-float">
            <SidebarContent
              company={company}
              navigate={navigate}
              onNavigate={() => setMobileOpen(false)}
              closeButton={
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar menú"
                >
                  <IconClose className="h-5 w-5" />
                </button>
              }
            />
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            aria-label="Abrir menú"
          >
            <IconMenu className="h-[18px] w-[18px]" />
          </button>
          <Link to="/app" className="lg:hidden">
            <Logo />
          </Link>

          <button
            onClick={() => setPaletteOpen(true)}
            className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 transition hover:border-slate-300 hover:text-slate-600 lg:ml-0 lg:w-80"
          >
            <IconSearch className="h-4 w-4" />
            <span className="hidden lg:inline">Buscar o saltar a…</span>
            <span className="ml-auto hidden items-center gap-1 lg:flex">
              <span className="kbd">⌘</span>
              <span className="kbd">K</span>
            </span>
          </button>

          <Link to="/app/juegos/punto-de-encuentro/nueva" className="btn-primary btn-sm ml-2 hidden sm:inline-flex lg:ml-auto">
            <IconPlus className="h-3.5 w-3.5" />
            Nueva sesión
          </Link>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Toaster />
    </div>
  )
}

function SidebarContent({ company, navigate, onNavigate, closeButton }) {
  const link = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-white/10 text-white shadow-ring' : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-6">
        <button
          onClick={() => {
            navigate('/app')
            onNavigate?.()
          }}
          className="flex items-center"
        >
          <Logo className="text-white" />
        </button>
        {closeButton}
      </div>

      <nav className="mt-7 flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={link} onClick={onNavigate}>
                  <item.Icon className="h-[18px] w-[18px] shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {company && (
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold">
              {company.name?.[0]?.toUpperCase() || '·'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{company.name}</div>
              <div className="truncate text-[11px] text-slate-500">{company.email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              actions.logout()
              navigate('/')
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <IconLogout className="h-[18px] w-[18px]" />
            Cerrar sesión
          </button>
        </div>
      )}
    </>
  )
}
