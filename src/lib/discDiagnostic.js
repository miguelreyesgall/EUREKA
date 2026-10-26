// Encuesta previa de Código DISC. Mismo formato de elección forzada que el
// diagnóstico de Mando Íntegro (la palabra que MÁS y la que MENOS te
// representa), pero con las 4 columnas del modelo DISC.
//
// ⚠️ PROVISIONAL: el contenido de estas 18 filas lo redactamos nosotros
// siguiendo el formato estándar de un instrumento DISC. Debe reemplazarse por
// el cuestionario oficial de Eureka antes de usarlo con un cliente real.

export const DISC_PROFILES = [
  {
    id: 'D',
    label: 'Dominante',
    short: 'resultados y decisión',
    color: '#ef4444',
    desc: 'Vas directo al resultado, decides rápido y no le temes al conflicto.',
    risk: 'Atropellar al equipo por ir rápido, o decidir sin escuchar las otras miradas.'
  },
  {
    id: 'I',
    label: 'Influyente',
    short: 'personas y entusiasmo',
    color: '#f59e0b',
    desc: 'Conectas con las personas, entusiasmas al equipo y piensas en voz alta.',
    risk: 'Quedarte en la idea sin aterrizarla, o evitar la conversación incómoda por cuidar el ambiente.'
  },
  {
    id: 'S',
    label: 'Estable',
    short: 'consenso y constancia',
    color: '#22c55e',
    desc: 'Buscas consenso, cuidas el ritmo del equipo y sostienes la calma en la tensión.',
    risk: 'Ceder demasiado para evitar fricción, o resistirte a los cambios bruscos.'
  },
  {
    id: 'C',
    label: 'Cauteloso',
    short: 'análisis y precisión',
    color: '#3b82f6',
    desc: 'Analizas antes de actuar, cuidas el detalle y validas que la solución sea viable.',
    risk: 'Paralizarte buscando certeza, o enfriar al equipo con exceso de reparos.'
  }
]

export const DISC_PROFILE_MAP = Object.fromEntries(DISC_PROFILES.map((p) => [p.id, p]))
export const DISC_PROFILE_IDS = DISC_PROFILES.map((p) => p.id)

// 18 filas · columnas en orden D · I · S · C
export const DISC_DIAG_ROWS = [
  ['Decidido', 'Entusiasta', 'Paciente', 'Analítico'],
  ['Directo', 'Sociable', 'Leal', 'Preciso'],
  ['Competitivo', 'Expresivo', 'Sereno', 'Metódico'],
  ['Audaz', 'Optimista', 'Constante', 'Prudente'],
  ['Firme', 'Persuasivo', 'Colaborador', 'Riguroso'],
  ['Exigente', 'Comunicativo', 'Comprensivo', 'Detallista'],
  ['Resuelto', 'Animado', 'Tranquilo', 'Lógico'],
  ['Enérgico', 'Espontáneo', 'Confiable', 'Organizado'],
  ['Retador', 'Carismático', 'Armonioso', 'Sistemático'],
  ['Determinado', 'Alegre', 'Atento', 'Objetivo'],
  ['Frontal', 'Convincente', 'Considerado', 'Reservado'],
  ['Ambicioso', 'Extrovertido', 'Estable', 'Minucioso'],
  ['Impulsor', 'Inspirador', 'Amable', 'Cauteloso'],
  ['Contundente', 'Ocurrente', 'Perseverante', 'Exacto'],
  ['Arriesgado', 'Abierto', 'Receptivo', 'Formal'],
  ['Tajante', 'Efusivo', 'Cordial', 'Crítico'],
  ['Emprendedor', 'Simpático', 'Conciliador', 'Estructurado'],
  ['Dominante', 'Elocuente', 'Discreto', 'Perfeccionista']
]

export function scoreDiscDiagnostic(answers = {}) {
  const most = Object.fromEntries(DISC_PROFILE_IDS.map((id) => [id, 0]))
  const least = Object.fromEntries(DISC_PROFILE_IDS.map((id) => [id, 0]))

  for (const row of Object.values(answers)) {
    if (row?.most && most[row.most] !== undefined) most[row.most] += 1
    if (row?.least && least[row.least] !== undefined) least[row.least] += 1
  }

  const net = Object.fromEntries(DISC_PROFILE_IDS.map((id) => [id, most[id] - least[id]]))
  const ranked = [...DISC_PROFILE_IDS].sort((a, b) => net[b] - net[a])

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

export function isDiscDiagnosticComplete(answers = {}) {
  return DISC_DIAG_ROWS.every((_, i) => answers[i]?.most && answers[i]?.least && answers[i].most !== answers[i].least)
}
