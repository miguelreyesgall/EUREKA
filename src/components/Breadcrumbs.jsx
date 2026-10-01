import { Link } from 'react-router-dom'
import { IconChevronRight } from './icons'

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-400">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <IconChevronRight className="h-3 w-3 shrink-0 text-slate-300" />}
          {it.to ? (
            <Link to={it.to} className="rounded px-1 py-0.5 hover:text-brand-600">
              {it.label}
            </Link>
          ) : (
            <span className="truncate px-1 py-0.5 text-slate-600">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
