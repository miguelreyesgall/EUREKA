import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GAMES } from '../lib/games'
import { useCompanySessions } from '../lib/store'
import {
  IconArrowRight,
  IconChart,
  IconGrid,
  IconHome,
  IconLayers,
  IconPlus,
  IconSearch,
  IconSettings,
  IconUsers
} from './icons'

const NAV_COMMANDS = [
  { id: 'nav-panel', label: 'Ir al panel', group: 'Navegación', to: '/app', Icon: IconHome },
  { id: 'nav-sesiones', label: 'Ver todas las sesiones', group: 'Navegación', to: '/app/sesiones', Icon: IconLayers },
  { id: 'nav-juegos', label: 'Explorar juegos', group: 'Navegación', to: '/app/juegos', Icon: IconGrid },
  { id: 'nav-personas', label: 'Ver personas', group: 'Navegación', to: '/app/personas', Icon: IconUsers },
  { id: 'nav-analitica', label: 'Abrir analítica', group: 'Navegación', to: '/app/analitica', Icon: IconChart },
  { id: 'nav-biblioteca', label: 'Biblioteca de mazos y cartas', group: 'Navegación', to: '/app/biblioteca', Icon: IconLayers },
  { id: 'nav-config', label: 'Configuración de la cuenta', group: 'Navegación', to: '/app/configuracion', Icon: IconSettings },
  {
    id: 'action-nueva',
    label: 'Crear nueva sesión de Punto de Encuentro',
    group: 'Acciones',
    to: '/app/juegos/punto-de-encuentro/nueva',
    Icon: IconPlus
  }
]

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const sessions = useCompanySessions()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const commands = useMemo(() => {
    const sessionCommands = sessions.slice(0, 8).map((s) => ({
      id: `session-${s.id}`,
      label: s.name,
      hint: s.status === 'completed' ? 'Reporte' : s.status === 'draft' ? 'Borrador' : 'En juego',
      group: 'Sesiones',
      to: s.status === 'completed' ? `/app/sesion/${s.id}/reporte` : `/app/sesion/${s.id}`,
      Icon: IconLayers
    }))
    const gameCommands = GAMES.map((g) => ({
      id: `game-${g.id}`,
      label: g.name,
      hint: g.status === 'available' ? 'Disponible' : 'Próximamente',
      group: 'Juegos',
      to: `/app/juegos/${g.id}`,
      Icon: IconGrid
    }))
    return [...NAV_COMMANDS, ...gameCommands, ...sessionCommands]
  }, [sessions])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.group} ${c.hint || ''}`.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => setCursor(0), [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCursor((c) => Math.min(c + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCursor((c) => Math.max(c - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const target = results[cursor]
        if (target) {
          navigate(target.to)
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, cursor, navigate, onClose])

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!open) return null

  let lastGroup = null

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl bg-white shadow-float">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <IconSearch className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar sesiones, juegos o acciones…"
            className="w-full bg-transparent py-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <span className="kbd shrink-0">ESC</span>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-10 text-center text-sm text-slate-400">Sin resultados para “{query}”.</p>
          )}
          {results.map((c, i) => {
            const showGroup = c.group !== lastGroup
            lastGroup = c.group
            const active = i === cursor
            return (
              <div key={c.id}>
                {showGroup && <div className="section-title px-3 pb-1 pt-3">{c.group}</div>}
                <button
                  data-active={active}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    navigate(c.to)
                    onClose()
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    active ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <c.Icon className={`h-4 w-4 shrink-0 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="flex-1 truncate font-medium">{c.label}</span>
                  {c.hint && <span className="shrink-0 text-xs text-slate-400">{c.hint}</span>}
                  {active && <IconArrowRight className="h-3.5 w-3.5 shrink-0 text-brand-500" />}
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="kbd">↑</span><span className="kbd">↓</span> navegar</span>
          <span className="flex items-center gap-1"><span className="kbd">↵</span> abrir</span>
          <span className="ml-auto flex items-center gap-1"><span className="kbd">⌘</span><span className="kbd">K</span></span>
        </div>
      </div>
    </div>
  )
}
