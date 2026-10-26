// "Mando Íntegro — el liderazgo no se manda, se equilibra".
//
// Sendero de 18 casillas (Base -> Cumbre) + Balanza de 3 columnas
// (Cabeza / Corazón / Manos). En cada turno un Líder distinto resuelve un
// dilema eligiendo una de las 3 respuestas; esa columna sube 1. El equipo
// avanza 1 casilla y 1 extra si la Balanza sigue equilibrada.
//
// Contenido literal de los documentos "mazo_dilemas", "tablero_mando_integro",
// "matriz_de_aprendizaje" y "manual_guia".

import { BALANCE_MAX, DIMENSIONS, DIMENSION_IDS, DIMENSION_MAP } from './diagnostic'

export { BALANCE_MAX, DIMENSIONS, DIMENSION_IDS, DIMENSION_MAP }

export const PATH_LENGTH = 18
export const SUMMIT = PATH_LENGTH

// "Si una columna queda muy por delante de las otras dos, el equipo pierde el
// turno de bonificación": la Balanza está equilibrada mientras la diferencia
// entre la columna más alta y la más baja no pase de 2.
export const BALANCE_TOLERANCE = 2

export const DILEMMA_DECKS = [
  {
    id: 'decisiones',
    label: 'Toma de decisiones',
    icon: '⚖️',
    color: '#6366f1',
    closing: '¿En qué dilema sentiste más tentación de decidir solo, sin pasar por las otras dos dimensiones?',
    dilemmas: [
      {
        text: 'Debes decidir si lanzar el proyecto con datos incompletos o esperar una semana más y arriesgar el plazo.',
        cabeza: 'Analizas los datos disponibles y decides con el mejor estimado, aceptando el riesgo calculado.',
        corazon: 'Preguntas al equipo cómo se siente con la incertidumbre antes de decidir juntos.',
        manos: 'Lanzas una versión reducida ahora mismo y ajustas sobre la marcha.'
      },
      {
        text: 'Un proveedor te ofrece un atajo que ahorra tiempo pero compromete un poco la calidad.',
        cabeza: 'Comparas cifras de costo-beneficio antes de aceptar o rechazar.',
        corazon: 'Piensas en cómo afectaría esto la confianza del cliente final.',
        manos: 'Pruebas el atajo en una parte pequeña del proyecto antes de decidir del todo.'
      },
      {
        text: 'Tienes que elegir entre dos personas del equipo para liderar un proyecto clave.',
        cabeza: 'Comparas objetivamente el desempeño y las habilidades de cada una.',
        corazon: 'Consideras quién necesita más esta oportunidad de crecimiento ahora.',
        manos: 'Les das a ambas una tarea de prueba esta semana y decides con evidencia.'
      },
      {
        text: 'El comité te pide una decisión en la reunión, pero no tienes toda la información.',
        cabeza: 'Pides una hora más para analizar los datos disponibles antes de responder.',
        corazon: 'Eres honesto con el comité sobre tu incertidumbre y pides su opinión.',
        manos: 'Decides con lo que tienes y ajustas la próxima semana si es necesario.'
      },
      {
        text: 'Debes decidir si automatizar un proceso que le quitaría trabajo a dos personas del equipo.',
        cabeza: 'Evalúas el impacto real en productividad antes de decidir.',
        corazon: 'Hablas primero con las dos personas antes de decidir nada.',
        manos: 'Empiezas una prueba piloto pequeña para ver el impacto real.'
      }
    ]
  },
  {
    id: 'feedback',
    label: 'Feedback empático',
    icon: '🗣️',
    color: '#dc2626',
    closing: '¿Qué tan fácil o difícil te resultó combinar honestidad con cuidado en la misma respuesta?',
    dilemmas: [
      {
        text: 'Un miembro del equipo entregó un trabajo por debajo de su nivel habitual.',
        cabeza: 'Preparas puntos concretos y objetivos antes de la conversación.',
        corazon: 'Preguntas primero cómo está, antes de hablar del trabajo.',
        manos: 'Agendas la conversación para hoy mismo, sin dejarlo pasar.'
      },
      {
        text: 'Debes decirle a alguien que no fue promovido esta vez.',
        cabeza: 'Explicas con claridad los criterios que se usaron para decidir.',
        corazon: 'Validas la frustración que seguramente va a sentir.',
        manos: 'Le propones un plan concreto de desarrollo para la próxima oportunidad.'
      },
      {
        text: 'Alguien del equipo te da una retroalimentación difícil sobre tu propio liderazgo.',
        cabeza: 'Le pides ejemplos concretos para entender bien el punto.',
        corazon: 'Agradeces la honestidad antes de reaccionar a la crítica.',
        manos: 'Propones un cambio concreto que vas a probar la próxima semana.'
      },
      {
        text: 'Un jefe de otra área se queja de un miembro de tu equipo frente a ti.',
        cabeza: 'Pides detalles específicos antes de sacar conclusiones.',
        corazon: 'Defiendes a tu colaborador con respeto frente a la crítica.',
        manos: 'Agendas una conversación a tres para resolverlo directamente.'
      },
      {
        text: 'Debes dar feedback a alguien que se pone muy a la defensiva.',
        cabeza: 'Te apoyas en datos concretos, no en opiniones.',
        corazon: 'Bajas el ritmo y validas cómo se siente antes de seguir.',
        manos: 'Terminas la conversación con un acuerdo concreto por escrito.'
      }
    ]
  },
  {
    id: 'cambio',
    label: 'Gestión del cambio',
    icon: '🔄',
    color: '#14b8a6',
    closing: '¿Qué dimensión se te olvida primero cuando todo cambia rápido a tu alrededor?',
    dilemmas: [
      {
        text: 'La empresa anuncia una reestructuración que afecta a tu equipo.',
        cabeza: 'Analizas qué cambia realmente en la operación del día a día.',
        corazon: 'Haces espacio para que el equipo exprese cómo se siente.',
        manos: 'Defines los primeros 3 pasos concretos para adaptarse esta semana.'
      },
      {
        text: 'Deben migrar a una herramienta nueva que el equipo no domina.',
        cabeza: 'Evalúas qué tan compleja es la curva de aprendizaje real.',
        corazon: 'Reconoces abiertamente que también te cuesta a ti el cambio.',
        manos: 'Agendas una sesión práctica de prueba esta misma semana.'
      },
      {
        text: 'Tu jefe te pide implementar un cambio con el que no estás de acuerdo.',
        cabeza: 'Pides los datos o razones detrás de la decisión.',
        corazon: 'Expresas tu desacuerdo con respeto antes de ejecutar.',
        manos: 'Ejecutas el cambio y documentas los resultados reales para revisarlo después.'
      },
      {
        text: 'El equipo debe adoptar una nueva forma de trabajar de un día para otro.',
        cabeza: 'Divides el cambio en pasos pequeños y manejables.',
        corazon: 'Preguntas quién se siente más inseguro con el cambio.',
        manos: 'Tú mismo modelas el nuevo comportamiento primero.'
      },
      {
        text: 'Un proyecto en el que llevaban meses se cancela de repente.',
        cabeza: 'Evalúas qué se puede reutilizar del trabajo ya hecho.',
        corazon: 'Reconoces la frustración del equipo antes de seguir adelante.',
        manos: 'Rediriges al equipo a la nueva prioridad en la misma semana.'
      }
    ]
  },
  {
    id: 'conflicto',
    label: 'Conflicto',
    icon: '⚡',
    color: '#f59e0b',
    closing: '¿Te costó más entender los hechos, cuidar la relación, o llegar a una acción concreta?',
    dilemmas: [
      {
        text: 'Dos personas del equipo llevan semanas sin hablarse por un desacuerdo.',
        cabeza: 'Buscas entender los hechos concretos detrás del conflicto.',
        corazon: 'Hablas con cada una por separado antes de juntarlas.',
        manos: 'Programas una conversación conjunta esta misma semana.'
      },
      {
        text: 'Un cliente y un miembro de tu equipo tienen una fuerte discrepancia.',
        cabeza: 'Revisas el contrato o los acuerdos antes de opinar.',
        corazon: 'Escuchas primero las emociones de ambas partes.',
        manos: 'Propones una solución concreta en la misma llamada.'
      },
      {
        text: 'El equipo se divide en dos posturas sobre cómo avanzar un proyecto.',
        cabeza: 'Pides datos que respalden cada postura antes de decidir.',
        corazon: 'Cuidas que nadie sienta que “perdió” la discusión.',
        manos: 'Defines una prueba piloto que combine ambas ideas.'
      },
      {
        text: 'Alguien se siente pasado por alto en una decisión importante.',
        cabeza: 'Explicas con claridad cómo se tomó la decisión.',
        corazon: 'Reconoces el impacto emocional de sentirse excluido.',
        manos: 'Lo incluyes de forma concreta en la siguiente decisión.'
      },
      {
        text: 'Dos áreas se culpan mutuamente por un mismo error.',
        cabeza: 'Reconstruyes los hechos de forma objetiva, sin buscar culpables.',
        corazon: 'Bajas la tensión reconociendo que ambas partes actuaron de buena fe.',
        manos: 'Defines una acción correctiva concreta para que no se repita.'
      }
    ]
  },
  {
    id: 'hibrido',
    label: 'Liderazgo híbrido',
    icon: '🌐',
    color: '#0ea5e9',
    closing: '¿La distancia física te hizo inclinarte más hacia una dimensión que hacia otra?',
    dilemmas: [
      {
        text: 'Parte del equipo trabaja remoto y siente que se pierde información clave.',
        cabeza: 'Rediseñas el proceso de comunicación con canales más claros.',
        corazon: 'Preguntas directamente cómo se sienten con la situación actual.',
        manos: 'Implementas un resumen semanal escrito esta misma semana.'
      },
      {
        text: 'Notas que las decisiones se toman más en la oficina que en remoto.',
        cabeza: 'Analizas en qué reuniones realmente se está decidiendo algo.',
        corazon: 'Reconoces que esto puede sentirse injusto para el equipo remoto.',
        manos: 'Cambias el formato de esa reunión para que sea híbrida de verdad.'
      },
      {
        text: 'Un colaborador remoto siente que no lo conocen tan bien como a los presenciales.',
        cabeza: 'Revisas objetivamente si ha tenido las mismas oportunidades.',
        corazon: 'Agendas un espacio personal de conexión con él.',
        manos: 'Lo incluyes activamente en la próxima conversación estratégica.'
      },
      {
        text: 'Hay quejas sobre reuniones excesivas entre husos horarios distintos.',
        cabeza: 'Evalúas cuáles reuniones son realmente necesarias en vivo.',
        corazon: 'Preguntas al equipo qué horarios les generan más desgaste.',
        manos: 'Rediseñas el calendario de reuniones esta misma semana.'
      },
      {
        text: 'El equipo remoto siente menos reconocimiento que el presencial.',
        cabeza: 'Revisas si el reconocimiento se ha distribuido de forma pareja.',
        corazon: 'Preguntas directamente cómo les gustaría ser reconocidos.',
        manos: 'Haces un reconocimiento público esta semana a alguien remoto.'
      }
    ]
  },
  {
    id: 'bienestar',
    label: 'Bienestar del equipo',
    icon: '🌱',
    color: '#16a34a',
    closing: '¿Qué dimensión usas menos cuando se trata de cuidar tu propio bienestar como líder?',
    dilemmas: [
      {
        text: 'Notas que alguien del equipo está trabajando muchas horas extra.',
        cabeza: 'Revisas objetivamente su carga de trabajo actual.',
        corazon: 'Le preguntas directamente cómo se siente, sin juzgar.',
        manos: 'Redistribuyes parte de su carga esta misma semana.'
      },
      {
        text: 'El ambiente general del equipo se siente tenso últimamente.',
        cabeza: 'Buscas patrones o causas concretas detrás de la tensión.',
        corazon: 'Abres un espacio honesto para que el equipo hable.',
        manos: 'Propones una acción concreta para aliviar la presión esta semana.'
      },
      {
        text: 'Alguien te pide una reducción temporal de carga por motivos personales.',
        cabeza: 'Evalúas el impacto real en los plazos del equipo.',
        corazon: 'Le agradeces la confianza de habértelo contado.',
        manos: 'Ajustas sus entregas esta misma semana para acomodar la situación.'
      },
      {
        text: 'El equipo cumple las metas, pero parece agotado.',
        cabeza: 'Analizas si el ritmo actual es sostenible en el tiempo.',
        corazon: 'Reconoces abiertamente el esfuerzo que han hecho.',
        manos: 'Programas un descanso o pausa concreta la próxima semana.'
      },
      {
        text: 'Detectas señales de desmotivación en alguien que antes era muy proactivo.',
        cabeza: 'Revisas si algo cambió en sus responsabilidades últimamente.',
        corazon: 'Le preguntas con calma qué ha estado sintiendo.',
        manos: 'Le das una nueva responsabilidad pequeña y visible esta semana.'
      }
    ]
  }
]

export const DECK_MAP = Object.fromEntries(DILEMMA_DECKS.map((d) => [d.id, d]))

export const CLOSING_GENERAL =
  'Viendo cómo terminó tu Balanza hoy, ¿qué dimensión necesitas fortalecer esta semana en tu equipo real?'

export const LEARNING_MATRIX_BLOCKS = [
  { id: 'autoconocimiento', label: 'Autoconocimiento', question: '¿Qué descubriste hoy sobre cómo lideras bajo presión?' },
  { id: 'reconocimiento', label: 'Reconocimiento al otro', question: '¿Qué dimensión de otro líder de tu mesa te hizo ver algo distinto?' },
  { id: 'aplicacion', label: 'Aplicación real', question: '¿Qué dilema del juego se parece a una situación real que estás viviendo?' },
  { id: 'compromiso', label: 'Compromiso', question: '¿Qué vas a hacer distinto esta semana con tu dimensión más débil?' }
]

// Agenda sugerida del Manual del Guía (60 minutos).
export const FACILITATOR_AGENDA = [
  ['0:00 – 0:05', 'Bienvenida', 'Explica el objetivo del juego y recuerda el resultado del diagnóstico previo de cada líder.'],
  ['0:05 – 0:10', 'Reglas', 'Explica el sendero, la Balanza y el rol rotativo de Líder de turno.'],
  ['0:10 – 0:45', 'Juego', 'Recorre el sendero: dilemas, decisiones y avance por la Balanza.'],
  ['0:45 – 0:55', 'Debrief', 'Facilita el cierre con las preguntas guía.'],
  ['0:55 – 1:00', 'Cierre', 'Cada líder define su compromiso concreto de la semana.']
]

export const FACILITATOR_TIPS = [
  'No corrijas la respuesta del Líder de turno en el momento — el aprendizaje está en ver el patrón acumulado en la Balanza, no en juzgar una decisión aislada.',
  'Si alguien siempre elige la misma columna, señálalo en el debrief con curiosidad, no como error: “noté que casi siempre fuiste a Manos, ¿qué pasaría si probaras Corazón primero?”.',
  'Deja que el grupo discuta antes de que el Líder de turno decida — el valor está en escuchar distintas voces antes de resolver.',
  'Si el equipo llega “cansado” (Balanza desequilibrada), no lo trates como una derrota: es el mejor material de debrief que puede pasar.'
]

// ---------------------------------------------------------------------------
// Reglas
// ---------------------------------------------------------------------------

export function balanceSpread(balance) {
  const values = DIMENSION_IDS.map((id) => balance?.[id] ?? 0)
  return Math.max(...values) - Math.min(...values)
}

export function isBalanced(balance) {
  return balanceSpread(balance) <= BALANCE_TOLERANCE
}

export function leadingDimension(balance) {
  return [...DIMENSION_IDS].sort((a, b) => (balance[b] ?? 0) - (balance[a] ?? 0))[0]
}

export function laggingDimension(balance) {
  return [...DIMENSION_IDS].sort((a, b) => (balance[a] ?? 0) - (balance[b] ?? 0))[0]
}

// Zona de equilibrio para pintar en la Balanza: banda alrededor del promedio.
export function equilibriumBand(balance) {
  const values = DIMENSION_IDS.map((id) => balance?.[id] ?? 0)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return {
    min: Math.max(0, avg - BALANCE_TOLERANCE / 2),
    max: Math.min(BALANCE_MAX, avg + BALANCE_TOLERANCE / 2)
  }
}

// Dilema de la ronda: recorre los 6 mazos en orden y avanza de dilema al dar la vuelta.
export function dilemmaForRound(roundIndex) {
  const deck = DILEMMA_DECKS[roundIndex % DILEMMA_DECKS.length]
  const dilemmaIndex = Math.floor(roundIndex / DILEMMA_DECKS.length) % deck.dilemmas.length
  return { deck, dilemmaIndex, dilemma: deck.dilemmas[dilemmaIndex] }
}

// Aplica una decision del Lider de turno y devuelve el nuevo estado.
export function applyChoice({ balance, position }, choice) {
  const nextBalance = { ...balance, [choice]: Math.min(BALANCE_MAX, (balance[choice] ?? 0) + 1) }
  const balanced = isBalanced(nextBalance)
  const steps = balanced ? 2 : 1
  return {
    balance: nextBalance,
    position: Math.min(SUMMIT, position + steps),
    balanced,
    steps
  }
}

// ---------------------------------------------------------------------------
// Reporte
// ---------------------------------------------------------------------------

export function computeMandoReport(session) {
  const participants = session.participants || []
  const rounds = session.rounds || []
  const balance = session.balance || { cabeza: 0, corazon: 0, manos: 0 }

  const spread = balanceSpread(balance)
  const balanced = spread <= BALANCE_TOLERANCE
  const ending = balanced ? 'equilibrado' : 'cansado'
  const reachedSummit = (session.position ?? 0) >= SUMMIT

  const choiceTotals = Object.fromEntries(DIMENSION_IDS.map((id) => [id, 0]))
  for (const r of rounds) if (choiceTotals[r.choice] !== undefined) choiceTotals[r.choice] += 1

  const bonusRounds = rounds.filter((r) => r.balanced).length

  // Por líder: qué eligió cuando le tocó decidir, y si coincide con su diagnóstico.
  const leaders = participants.map((p) => {
    const led = rounds.filter((r) => r.leaderId === p.id)
    const counts = Object.fromEntries(DIMENSION_IDS.map((id) => [id, 0]))
    for (const r of led) if (counts[r.choice] !== undefined) counts[r.choice] += 1

    const mostUsed = led.length ? [...DIMENSION_IDS].sort((a, b) => counts[b] - counts[a])[0] : null
    const leastUsed = led.length ? [...DIMENSION_IDS].sort((a, b) => counts[a] - counts[b])[0] : null
    const dominant = p.diagnostic?.dominant || null

    return {
      id: p.id,
      name: p.name,
      role: p.role,
      diagnostic: p.diagnostic || null,
      dominant,
      weakest: p.diagnostic?.weakest || null,
      turnsLed: led.length,
      counts,
      mostUsed,
      leastUsed,
      // El hallazgo central del juego: ¿lideró desde su dimensión dominante?
      matchedDiagnostic: dominant && mostUsed ? dominant === mostUsed : null,
      rounds: led
    }
  })

  const teamDominant = leadingDimension(choiceTotals)
  const teamWeakest = laggingDimension(choiceTotals)

  const narrative = buildNarrative({
    session,
    balance,
    spread,
    ending,
    reachedSummit,
    bonusRounds,
    rounds,
    teamDominant,
    teamWeakest,
    leaders
  })

  return {
    balance,
    spread,
    balanced,
    ending,
    reachedSummit,
    position: session.position ?? 0,
    totalRounds: rounds.length,
    bonusRounds,
    choiceTotals,
    teamDominant,
    teamWeakest,
    leaders,
    rounds,
    learningMatrix: session.learningMatrix || {},
    commitments: session.commitments || [],
    closingAnswers: session.closingAnswers || {}
  }
}

function buildNarrative({ balance, spread, ending, reachedSummit, bonusRounds, rounds, teamDominant, teamWeakest, leaders }) {
  const parts = []
  const dom = DIMENSION_MAP[teamDominant]
  const weak = DIMENSION_MAP[teamWeakest]

  parts.push(
    reachedSummit
      ? `El equipo llegó a la Cumbre en ${rounds.length} turnos y terminó “${ending}”: la Balanza cerró en ${balance.cabeza}-${balance.corazon}-${balance.manos} (diferencia de ${spread} entre la columna más alta y la más baja).`
      : `La partida quedó en la casilla ${rounds.length ? rounds[rounds.length - 1].position : 0} de ${SUMMIT}, con la Balanza en ${balance.cabeza}-${balance.corazon}-${balance.manos}.`
  )

  parts.push(
    `La dimensión que más movió al equipo fue ${dom?.label?.toLowerCase()} (${dom?.short}), y la que menos apareció fue ${weak?.label?.toLowerCase()}. ${
      ending === 'equilibrado'
        ? 'Mantener las tres columnas parejas les dio turnos de bonificación y los hizo avanzar más rápido.'
        : 'Inclinarse siempre hacia el mismo lado les costó turnos de bonificación en el sendero.'
    }`
  )

  if (rounds.length) {
    parts.push(
      `Obtuvieron bonificación por equilibrio en ${bonusRounds} de ${rounds.length} turnos (${Math.round((bonusRounds / rounds.length) * 100)}%).`
    )
  }

  const mismatched = leaders.filter((l) => l.matchedDiagnostic === false)
  const matched = leaders.filter((l) => l.matchedDiagnostic === true)
  if (matched.length) {
    parts.push(
      `${matched.map((l) => l.name).join(', ')} ${matched.length > 1 ? 'lideraron' : 'lideró'} desde su dimensión dominante del diagnóstico: el patrón declarado y el real coinciden.`
    )
  }
  if (mismatched.length) {
    parts.push(
      `${mismatched.map((l) => l.name).join(', ')} ${mismatched.length > 1 ? 'decidieron' : 'decidió'} con una dimensión distinta a la que el diagnóstico marcaba como dominante — vale la pena contrastarlo en el debrief.`
    )
  }

  return parts
}
