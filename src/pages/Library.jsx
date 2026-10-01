import { useState } from 'react'
import AppShell from '../components/AppShell'
import { PageHeader, SectionHeader, StatCard } from '../components/ui'
import { IconCards, IconChevronDown, IconLayers, IconTarget } from '../components/icons'
import { CLOSING_DECK, DECKS, DISC_STYLES, MIN_STYLES_TO_PLACE, ROUND_MINUTES } from '../lib/discGame'

export default function Library() {
  const [openDeck, setOpenDeck] = useState(DECKS[0]?.id || null)
  const totalCards = DECKS.reduce((n, d) => n + d.cards.length, 0)

  return (
    <AppShell>
      <PageHeader
        eyebrow={<span className="chip bg-brand-50 text-brand-700">Punto de Encuentro</span>}
        title="Biblioteca de contenido"
        description="Todas las cartas, mazos y referencias del juego para que el facilitador las revise antes de la sesión."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Mazos temáticos" value={DECKS.length} Icon={IconLayers} color="#4f46e5" />
        <StatCard label="Cartas de reto" value={totalCards} Icon={IconCards} color="#0d9488" />
        <StatCard
          label="Estilos por ficha"
          value={MIN_STYLES_TO_PLACE}
          suffix={`/ ${DISC_STYLES.length}`}
          Icon={IconTarget}
          color="#e11d48"
          hint="Mínimo para colocar en el punto de encuentro"
        />
      </div>

      {/* Referencia DISC */}
      <div className="mt-9">
        <SectionHeader title="Fichas de identidad (DISC)">
          Cada participante juega con una de estas cuatro fichas durante toda la sesión.
        </SectionHeader>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DISC_STYLES.map((s) => (
            <div key={s.id} className="card card-hover overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: s.color }} />
              <div className="p-5">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-base font-extrabold text-white"
                  style={{ background: s.color }}
                >
                  {s.id}
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900">{s.label}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mazos */}
      <div className="mt-9">
        <SectionHeader title="Mazos de retos">
          Cada ronda se juega con una carta de estos mazos, con {ROUND_MINUTES.min}-{ROUND_MINUTES.max} minutos para resolver.
        </SectionHeader>
        <div className="space-y-3">
          {DECKS.map((deck) => {
            const open = openDeck === deck.id
            return (
              <div key={deck.id} className="card overflow-hidden">
                <button
                  onClick={() => setOpenDeck(open ? null : deck.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl">
                    {deck.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900">{deck.label}</h3>
                    <p className="text-xs text-slate-400">{deck.cards.length} cartas en el mazo</p>
                  </div>
                  <IconChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>

                {open && (
                  <div className="grid gap-3 border-t border-slate-100 bg-slate-50/60 p-5 md:grid-cols-2">
                    {deck.cards.map((card, i) => (
                      <div key={i} className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="section-title">Carta {i + 1}</span>
                          <span className="text-xs text-slate-300">{deck.icon}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">“{card}”</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mazo de cierre */}
      <div className="mt-9">
        <SectionHeader title="Mazo de cierre">
          Preguntas de plenaria que alimentan la matriz de aprendizaje del reporte.
        </SectionHeader>
        <div className="card divide-y divide-slate-100">
          {CLOSING_DECK.map((c) => {
            const deck = DECKS.find((d) => d.id === c.deckId)
            return (
              <div key={c.deckId} className="flex items-start gap-4 p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-base">
                  {deck?.icon}
                </span>
                <div>
                  <div className="section-title">{deck?.label}</div>
                  <p className="mt-1 text-sm font-medium text-slate-700">{c.question}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
