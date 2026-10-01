// Modelo y contenido de "Punto de Encuentro": la version digital del tablero
// fisico DISC. El tablero real usa fichas de 4 colores (estilos de comportamiento)
// que los equipos colocan en el "punto de encuentro" central cuando logran que
// al menos 3 estilos distintos participen visiblemente en resolver una carta-reto.

export const DISC_STYLES = [
  {
    id: 'D',
    label: 'Dominante',
    color: '#ef4444',
    desc: 'Va directo al resultado, decide rápido y no le teme al conflicto.'
  },
  {
    id: 'I',
    label: 'Influyente',
    color: '#f59e0b',
    desc: 'Conecta con las personas, entusiasma al equipo y piensa en voz alta.'
  },
  {
    id: 'S',
    label: 'Estable',
    color: '#22c55e',
    desc: 'Busca consenso, cuida el ritmo del equipo y sostiene la calma bajo tensión.'
  },
  {
    id: 'C',
    label: 'Cauteloso',
    color: '#3b82f6',
    desc: 'Analiza antes de actuar, cuida el detalle y valida que la solución sea viable.'
  }
]

export const STYLE_MAP = Object.fromEntries(DISC_STYLES.map((s) => [s.id, s]))

export const MIN_STYLES_TO_PLACE = 3
export const ROUND_MINUTES = { min: 3, max: 5 }

export const DECKS = [
  {
    id: 'feedback',
    label: 'Feedback',
    icon: '🗣️',
    color: '#6366f1',
    cards: [
      'Un compañero entregó un trabajo con errores evidentes frente a todo el equipo. Denle feedback ahí mismo, sin humillarlo.',
      'Alguien del equipo lleva semanas sin mostrar avances pero nadie se lo ha dicho de frente. Practiquen cómo abordarlo hoy.',
      'Recibieron una crítica dura de un cliente sobre el trabajo del equipo. Decidan cómo comunicarla puertas adentro.',
      'Un integrante pide feedback sobre su desempeño del último mes. Denle una respuesta honesta y útil en 60 segundos.'
    ]
  },
  {
    id: 'presion',
    label: 'Bajo presión',
    icon: '⏱️',
    color: '#f59e0b',
    cards: [
      'Faltan 2 horas para la entrega y se cayó el proveedor clave. Decidan el plan B en el tiempo del reto.',
      'El cliente adelantó la reunión de cierre 3 días. Reprioricen lo que sí se puede mostrar.',
      'Dos personas del equipo están de baja el mismo día de la entrega. Redistribuyan las tareas ahora.',
      'El presupuesto se redujo a la mitad a mitad de proyecto. Decidan qué se sacrifica y qué se mantiene.'
    ]
  },
  {
    id: 'cambio',
    label: 'Cambio',
    icon: '🔄',
    color: '#14b8a6',
    cards: [
      'La empresa anuncia una reestructuración que afecta al equipo. Definan cómo comunicarlo a los demás.',
      'El proyecto en el que llevan 3 meses se cancela de un día para otro. Decidan el primer paso a seguir.',
      'Cambia el líder del equipo sin previo aviso. Acuerden qué necesita saber la persona nueva en su primer día.',
      'La herramienta que usan a diario deja de funcionar y deben migrar en una semana. Planeen la transición.'
    ]
  },
  {
    id: 'conflicto',
    label: 'Conflicto',
    icon: '⚡',
    color: '#f43f5e',
    cards: [
      'Dos integrantes del equipo llevan días sin hablarse por una decisión técnica. Medien el conflicto ahora.',
      'Alguien se atribuye en público un logro que fue de todo el equipo. Decidan cómo se maneja la situación.',
      'Un miembro del equipo siente que sus ideas nunca se toman en cuenta. Abran el espacio para resolverlo.',
      'Hay una queja anónima sobre la carga desigual de trabajo. Acuerden cómo investigarla y responder.'
    ]
  },
  {
    id: 'liderazgo',
    label: 'Liderazgo',
    icon: '🧭',
    color: '#8b5cf6',
    cards: [
      'El equipo se queda sin líder a mitad de un proyecto crítico. Decidan quién asume y qué necesita cada quien.',
      'Deben delegar una decisión importante a alguien más junior del equipo. Definan cómo prepararlo.',
      'Un integrante nuevo se siente perdido en su primera semana. Diseñen un plan de acompañamiento exprés.',
      'El equipo necesita motivación después de perder un cliente grande. Decidan cómo lo comunican y lo cierran.'
    ]
  },
  {
    id: 'comunicacion',
    label: 'Comunicación',
    icon: '💬',
    color: '#0ea5e9',
    cards: [
      'Dos áreas entendieron objetivos distintos para el mismo proyecto. Alineen el mensaje en los próximos 5 minutos.',
      'Un mensaje del equipo se malinterpretó y generó tensión con otro departamento. Redacten cómo aclararlo.',
      'El equipo trabaja mitad remoto, mitad presencial, y la información no llega igual a todos. Propongan una solución.',
      'Deben explicarle una decisión técnica compleja a alguien no técnico en 2 minutos. Practíquenlo.'
    ]
  }
]

export const CLOSING_DECK = [
  { deckId: 'feedback', question: '¿Qué aprendió el equipo hoy sobre cómo dar feedback bajo presión?' },
  { deckId: 'presion', question: '¿Qué estilo (D, I, S o C) apareció más cuando el tiempo apretaba?' },
  { deckId: 'cambio', question: '¿Qué haría diferente el equipo la próxima vez que algo cambie de golpe?' },
  { deckId: 'conflicto', question: '¿Qué le costó más al equipo: escuchar o proponer soluciones?' },
  { deckId: 'liderazgo', question: '¿Quién lideró sin tener el rol formal de líder durante el juego?' },
  { deckId: 'comunicacion', question: '¿En qué momento el equipo se entendió mejor sin hablar todos a la vez?' }
]

// Elige una carta de forma deterministica segun la sesion y el mazo, para que
// la misma ronda muestre siempre la misma carta aunque se recargue la pagina.
export function pickCard(sessionId, deck) {
  let hash = 0
  const key = `${sessionId}:${deck.id}`
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return deck.cards[hash % deck.cards.length]
}

export function distinctStyles(team, participantIds) {
  const styles = new Set()
  for (const pid of participantIds) {
    const p = team.participants.find((pp) => pp.id === pid)
    if (p?.style) styles.add(p.style)
  }
  return [...styles]
}

export function teamStyleCoverage(team) {
  return new Set(team.participants.map((p) => p.style).filter(Boolean))
}

// -----------------------------------------------------------------------------
// Reporte: agrega rondas + equipos + cierre en insights de grupo e individuales.
// -----------------------------------------------------------------------------
export function computeDiscReport(session) {
  const teams = session.teams || []
  const rounds = session.rounds || []

  const teamStats = teams.map((team) => {
    const teamRounds = rounds.filter((r) => r.teamId === team.id)
    const points = teamRounds.filter((r) => r.placed).length
    const coverage = teamStyleCoverage(team)
    return {
      id: team.id,
      name: team.name,
      participants: team.participants,
      points,
      roundsPlayed: teamRounds.length,
      coverage: [...coverage],
      canEverPlace: coverage.size >= MIN_STYLES_TO_PLACE
    }
  })

  const maxPoints = Math.max(0, ...teamStats.map((t) => t.points))
  const winners = teamStats.filter((t) => t.points === maxPoints && maxPoints > 0)

  const roundDetails = rounds.map((r) => {
    const deck = DECKS.find((d) => d.id === r.deckId)
    const team = teams.find((t) => t.id === r.teamId)
    const participants = (r.participantIds || [])
      .map((pid) => team?.participants.find((p) => p.id === pid))
      .filter(Boolean)
    return {
      ...r,
      deckLabel: deck?.label || r.deckId,
      deckIcon: deck?.icon || '🃏',
      teamName: team?.name || '—',
      participants,
      styles: distinctStyles(team || { participants: [] }, r.participantIds || [])
    }
  })

  // Participacion global por estilo en rondas exitosas (para ver que estilo aparece mas).
  const styleParticipation = Object.fromEntries(DISC_STYLES.map((s) => [s.id, 0]))
  for (const r of roundDetails) {
    if (!r.placed) continue
    for (const styleId of r.styles) styleParticipation[styleId] = (styleParticipation[styleId] || 0) + 1
  }
  const topStyle = DISC_STYLES.map((s) => ({ ...s, count: styleParticipation[s.id] })).sort(
    (a, b) => b.count - a.count
  )[0]

  // Individual: por cada participante, cuantas rondas lo marcaron como visible y cuantas de esas ganaron.
  const people = teams.flatMap((team) =>
    team.participants.map((p) => {
      const contributed = roundDetails.filter((r) => r.teamId === team.id && r.participantIds?.includes(p.id))
      const successful = contributed.filter((r) => r.placed)
      return {
        id: p.id,
        name: p.name,
        role: p.role,
        style: p.style ? STYLE_MAP[p.style] : null,
        teamId: team.id,
        teamName: team.name,
        contributedCount: contributed.length,
        successfulCount: successful.length
      }
    })
  )

  const learningMatrix = (session.closingAnswers || []).map((a) => {
    const topic = CLOSING_DECK.find((c) => c.deckId === a.deckId)
    return { deckId: a.deckId, question: topic?.question || '', answer: a.answer }
  })

  const narrative = buildNarrative({ teamStats, winners, topStyle, roundsTotal: rounds.length })

  return {
    teamStats: teamStats.sort((a, b) => b.points - a.points),
    winners,
    roundDetails,
    styleParticipation,
    topStyle,
    people,
    learningMatrix,
    narrative,
    totalRounds: rounds.length,
    totalPlaced: rounds.filter((r) => r.placed).length
  }
}

function buildNarrative({ teamStats, winners, topStyle, roundsTotal }) {
  const parts = []
  if (winners.length) {
    const names = winners.map((w) => w.name).join(' y ')
    parts.push(
      `${names} ${winners.length > 1 ? 'empataron' : 'ganó'} la dinámica con ${winners[0].points} de ${
        teamStats[0]?.roundsPlayed || 0
      } fichas colocadas en el punto de encuentro.`
    )
  } else if (roundsTotal > 0) {
    parts.push('Ningún equipo logró reunir 3 estilos distintos en la misma ronda: buena oportunidad para reforzar la participación cruzada.')
  }
  if (topStyle && topStyle.count > 0) {
    parts.push(
      `El estilo que más apareció en las soluciones ganadoras fue ${topStyle.label.toLowerCase()} (${topStyle.count} veces), lo que sugiere que el equipo se apoya con frecuencia en ese modo de resolver.`
    )
  }
  const weak = teamStats.filter((t) => !t.canEverPlace)
  if (weak.length) {
    parts.push(
      `${weak.map((t) => t.name).join(', ')} ${weak.length > 1 ? 'no tienen' : 'no tiene'} los 3 estilos mínimos representados en su plantilla: conviene rearmar los equipos para la próxima sesión.`
    )
  }
  return parts
}
