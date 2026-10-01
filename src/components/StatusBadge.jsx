const MAP = {
  draft: { label: 'Borrador', cls: 'bg-slate-100 text-slate-600' },
  in_progress: { label: 'En juego', cls: 'bg-amber-400/20 text-amber-600' },
  completed: { label: 'Completada', cls: 'bg-teal-500/15 text-teal-700' }
}

export default function StatusBadge({ status }) {
  const s = MAP[status] || MAP.draft
  return <span className={`chip ${s.cls}`}>{s.label}</span>
}
