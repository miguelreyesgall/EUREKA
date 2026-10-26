import { useState } from 'react'
import AppShell from '../components/AppShell'
import { PageHeader, SectionHeader, StatCard, Tabs } from '../components/ui'
import { IconCards, IconChevronDown, IconLayers, IconTarget } from '../components/icons'
import { CLOSING_DECK, DECKS, DISC_STYLES, MIN_STYLES_TO_PLACE, ROUND_MINUTES } from '../lib/discGame'
import {
  CLOSING_GENERAL,
  DILEMMA_DECKS,
  DIMENSIONS,
  LEARNING_MATRIX_BLOCKS,
  PATH_LENGTH
} from '../lib/mandoIntegro'
import { DIAGNOSTIC_ROWS } from '../lib/diagnostic'

export default function Library() {
  const [game, setGame] = useState('codigo-disc')

  return (
    <AppShell>
      <PageHeader
        eyebrow={<span className="section-title">Recursos</span>}
        title="Biblioteca de contenido"
        description="Todas las cartas, mazos y referencias de los juegos, para que el facilitador las revise antes de la sesión."
      />

      <Tabs
        value={game}
        onChange={setGame}
        tabs={[
          { value: 'codigo-disc', label: '🎯 Código DISC' },
          { value: 'mando-integro', label: '👑 Mando Íntegro' }
        ]}
      />

      <div className="mt-6">{game === 'codigo-disc' ? <DiscLibrary /> : <MandoLibrary />}</div>
    </AppShell>
  )
}

/* ------------------------------------------------------ Código DISC */

function DiscLibrary() {
  const [openDeck, setOpenDeck] = useState(DECKS[0]?.id || null)
  const totalCards = DECKS.reduce((n, d) => n + d.cards.length, 0)

  return (
    <>
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

      <div className="mt-9">
        <SectionHeader title="Mazos de retos">
          Cada ronda se juega con una carta, con {ROUND_MINUTES.min}-{ROUND_MINUTES.max} minutos para resolver.
        </SectionHeader>
        <div className="space-y-3">
          {DECKS.map((deck) => (
            <Accordion
              key={deck.id}
              open={openDeck === deck.id}
              onToggle={() => setOpenDeck(openDeck === deck.id ? null : deck.id)}
              icon={deck.icon}
              title={deck.label}
              subtitle={`${deck.cards.length} cartas en el mazo`}
            >
              <div className="grid gap-3 md:grid-cols-2">
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
            </Accordion>
          ))}
        </div>
      </div>

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
    </>
  )
}

/* ---------------------------------------------------- Mando Íntegro */

function MandoLibrary() {
  const [openDeck, setOpenDeck] = useState(DILEMMA_DECKS[0]?.id || null)
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const totalDilemmas = DILEMMA_DECKS.reduce((n, d) => n + d.dilemmas.length, 0)

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Mazos de dilemas" value={DILEMMA_DECKS.length} Icon={IconLayers} color="#0ea5e9" />
        <StatCard
          label="Dilemas"
          value={totalDilemmas}
          Icon={IconCards}
          color="#6366f1"
          hint="3 respuestas cada uno"
        />
        <StatCard label="Casillas del sendero" value={PATH_LENGTH} Icon={IconTarget} color="#16a34a" hint="De la Base a la Cumbre" />
      </div>

      <div className="mt-9">
        <SectionHeader title="Las tres dimensiones">
          Cada respuesta mueve una de estas columnas en la Balanza.
        </SectionHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          {DIMENSIONS.map((d) => (
            <div key={d.id} className="card card-hover overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: d.color }} />
              <div className="p-5">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-base font-extrabold text-white"
                  style={{ background: d.color }}
                >
                  {d.label[0]}
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900">{d.label}</h3>
                <p className="text-xs text-slate-400">{d.short}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{d.desc}</p>
                <p className="mt-2 text-xs leading-relaxed text-amber-600">Riesgo: {d.risk}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-9">
        <SectionHeader title="Mazos de dilemas">
          30 dilemas con 3 respuestas. Ninguna es la correcta: cada una inclina la Balanza.
        </SectionHeader>
        <div className="space-y-3">
          {DILEMMA_DECKS.map((deck) => (
            <Accordion
              key={deck.id}
              open={openDeck === deck.id}
              onToggle={() => setOpenDeck(openDeck === deck.id ? null : deck.id)}
              icon={deck.icon}
              title={deck.label}
              subtitle={`${deck.dilemmas.length} dilemas`}
            >
              <div className="space-y-3">
                {deck.dilemmas.map((d, i) => (
                  <div key={i} className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                    <span className="section-title">Dilema {i + 1}</span>
                    <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-800">“{d.text}”</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      {DIMENSIONS.map((dim) => (
                        <div
                          key={dim.id}
                          className="rounded-lg border p-2.5"
                          style={{ borderColor: `${dim.color}33`, background: `${dim.color}08` }}
                        >
                          <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: dim.color }}>
                            {dim.label}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">{d[dim.id]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="rounded-xl bg-slate-100 p-3">
                  <span className="section-title">Pregunta de cierre</span>
                  <p className="mt-1 text-sm font-medium text-slate-700">{deck.closing}</p>
                </div>
              </div>
            </Accordion>
          ))}
        </div>
      </div>

      <div className="mt-9">
        <SectionHeader title="Diagnóstico previo">
          18 filas de 3 palabras. Cada líder marca la que más y la que menos lo representa.
        </SectionHeader>
        <div className="card overflow-hidden">
          <button
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl">📝</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-900">Cuestionario completo</h3>
              <p className="text-xs text-slate-400">{DIAGNOSTIC_ROWS.length} filas · Cabeza / Corazón / Manos</p>
            </div>
            <IconChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${showDiagnostic ? 'rotate-180' : ''}`} />
          </button>
          {showDiagnostic && (
            <div className="border-t border-slate-100 bg-slate-50/60 p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-2 pr-3">#</th>
                      {DIMENSIONS.map((d) => (
                        <th key={d.id} className="pb-2 pr-3" style={{ color: d.color }}>
                          {d.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {DIAGNOSTIC_ROWS.map((row, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-3 text-xs text-slate-400">{i + 1}</td>
                        {row.map((w, c) => (
                          <td key={c} className="py-2 pr-3 text-slate-700">
                            {w}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-9">
        <SectionHeader title="Matriz de aprendizaje y cierre" />
        <div className="card divide-y divide-slate-100">
          {LEARNING_MATRIX_BLOCKS.map((b) => (
            <div key={b.id} className="p-5">
              <div className="section-title">{b.label}</div>
              <p className="mt-1 text-sm font-medium text-slate-700">{b.question}</p>
            </div>
          ))}
          <div className="bg-brand-50/40 p-5">
            <div className="section-title">Pregunta de cierre general</div>
            <p className="mt-1 text-sm font-medium text-slate-700">{CLOSING_GENERAL}</p>
          </div>
        </div>
      </div>
    </>
  )
}

function Accordion({ open, onToggle, icon, title, subtitle, children }) {
  return (
    <div className="card overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <IconChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-slate-100 bg-slate-50/60 p-5">{children}</div>}
    </div>
  )
}
