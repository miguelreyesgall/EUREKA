import { Link } from 'react-router-dom'
import Breadcrumbs from './Breadcrumbs'

export function PageHeader({ breadcrumbs, eyebrow, title, description, actions }) {
  return (
    <div className="mb-7">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className={`flex flex-wrap items-start justify-between gap-4 ${breadcrumbs ? 'mt-3' : ''}`}>
        <div className="min-w-0">
          {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-slate-900">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

export function SectionHeader({ title, action, actionTo, children }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="section-title">{title}</h2>
        {children && <p className="mt-1 text-xs text-slate-400">{children}</p>}
      </div>
      {action && actionTo && (
        <Link to={actionTo} className="text-xs font-semibold text-brand-600 transition hover:text-brand-700">
          {action} →
        </Link>
      )}
    </div>
  )
}

export function StatCard({ label, value, suffix, Icon, emoji, color = '#4f46e5', hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base"
          style={{ background: `${color}14`, color }}
        >
          {Icon ? <Icon className="h-[18px] w-[18px]" /> : emoji}
        </span>
        <div className="section-title">{label}</div>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-[28px] font-extrabold leading-none tracking-tight text-slate-900">{value}</span>
        {suffix && <span className="text-sm font-semibold text-slate-400">{suffix}</span>}
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export function EmptyState({ emoji = '✨', title, description, action }) {
  return (
    <div className="card grid place-items-center px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-3xl">{emoji}</div>
      <h3 className="mt-4 text-base font-bold text-slate-800">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ProgressBar({ value, max = 100, className = '', color }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color || 'linear-gradient(90deg,#6366f1,#2dd4bf)' }}
      />
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`rounded-lg px-4 py-2 transition ${
            value === t.value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
