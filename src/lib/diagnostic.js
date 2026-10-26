// Diagnostico previo de Mando Integro: 18 filas de 3 palabras. En cada fila el
// participante marca la palabra que MAS lo representa y la que MENOS. El neto
// (mas - menos) por columna define su dimension dominante y la mas debil.
//
// Contenido literal del documento "diagnostico_mando_integro".

export const DIMENSIONS = [
  {
    id: 'cabeza',
    label: 'Cabeza',
    short: 'estrategia y datos',
    color: '#2563eb',
    desc: 'Lideras primero con estrategia y datos.',
    risk: 'Decidir bien mientras el equipo se siente poco escuchado, o quedarte analizando en vez de actuar.'
  },
  {
    id: 'corazon',
    label: 'Corazón',
    short: 'empatía y conexión',
    color: '#dc2626',
    desc: 'Lideras primero con conexión y empatía.',
    risk: 'Evitar decisiones difíciles por no incomodar, o postergar la acción esperando el momento “perfecto” para todos.'
  },
  {
    id: 'manos',
    label: 'Manos',
    short: 'ejecución y acción',
    color: '#16a34a',
    desc: 'Lideras primero con acción y resultados.',
    risk: 'Avanzar sin el análisis suficiente, o sin haber cuidado el impacto emocional de tus decisiones en el equipo.'
  }
]

export const DIMENSION_MAP = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d]))
export const DIMENSION_IDS = DIMENSIONS.map((d) => d.id)

// 18 filas · columna A = Cabeza, B = Corazón, C = Manos
export const DIAGNOSTIC_ROWS = [
  ['Analítico', 'Empático', 'Ejecutor'],
  ['Estratégico', 'Cálido', 'Práctico'],
  ['Racional', 'Sensible', 'Resolutivo'],
  ['Objetivo', 'Compasivo', 'Activo'],
  ['Metódico', 'Cercano', 'Decidido'],
  ['Calculador', 'Comprensivo', 'Constante'],
  ['Reflexivo', 'Generoso', 'Diligente'],
  ['Lógico', 'Afectuoso', 'Eficaz'],
  ['Planificador', 'Solidario', 'Dinámico'],
  ['Prudente', 'Bondadoso', 'Proactivo'],
  ['Sistemático', 'Atento', 'Persistente'],
  ['Visionario', 'Amable', 'Ágil'],
  ['Preciso', 'Emotivo', 'Concreto'],
  ['Crítico', 'Acogedor', 'Productivo'],
  ['Ordenado', 'Humano', 'Enérgico'],
  ['Realista', 'Paciente', 'Aplicado'],
  ['Ecuánime', 'Tierno', 'Emprendedor'],
  ['Riguroso', 'Considerado', 'Tenaz']
]

export const DIAGNOSTIC_MINUTES = { min: 6, max: 8 }

// Puntos de arranque de la Balanza segun el ranking de dimensiones del
// participante. El documento sugiere algo como 6-3-3 sobre 10 en vez de 0-0-0.
export const START_BY_RANK = [6, 4, 3]
export const BALANCE_MAX = 10

// answers: { [rowIndex]: { most: 'cabeza'|'corazon'|'manos', least: ... } }
export function scoreDiagnostic(answers = {}) {
  const most = { cabeza: 0, corazon: 0, manos: 0 }
  const least = { cabeza: 0, corazon: 0, manos: 0 }

  for (const row of Object.values(answers)) {
    if (row?.most && most[row.most] !== undefined) most[row.most] += 1
    if (row?.least && least[row.least] !== undefined) least[row.least] += 1
  }

  const net = Object.fromEntries(DIMENSION_IDS.map((id) => [id, most[id] - least[id]]))
  // Desempate estable por el orden canonico Cabeza > Corazon > Manos.
  const ranked = [...DIMENSION_IDS].sort((a, b) => net[b] - net[a])

  return {
    most,
    least,
    net,
    ranked,
    dominant: ranked[0],
    weakest: ranked[ranked.length - 1],
    answeredRows: Object.values(answers).filter((r) => r?.most && r?.least).length
  }
}

export function isDiagnosticComplete(answers = {}) {
  return DIAGNOSTIC_ROWS.every((_, i) => answers[i]?.most && answers[i]?.least && answers[i].most !== answers[i].least)
}

// Balanza inicial de una persona a partir de su ranking.
export function startingBalanceFor(result) {
  if (!result?.ranked) return { cabeza: 4, corazon: 4, manos: 4 }
  const out = {}
  result.ranked.forEach((id, i) => {
    out[id] = START_BY_RANK[i] ?? 4
  })
  return out
}

// Balanza inicial del equipo: promedio de los diagnosticos disponibles.
export function teamStartingBalance(participants = []) {
  const withDiag = participants.filter((p) => p.diagnostic?.ranked)
  if (!withDiag.length) return { cabeza: 4, corazon: 4, manos: 4 }

  const totals = { cabeza: 0, corazon: 0, manos: 0 }
  for (const p of withDiag) {
    const b = startingBalanceFor(p.diagnostic)
    for (const id of DIMENSION_IDS) totals[id] += b[id]
  }
  return Object.fromEntries(DIMENSION_IDS.map((id) => [id, Math.round(totals[id] / withDiag.length)]))
}
