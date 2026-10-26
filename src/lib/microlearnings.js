// Microlearnings de refuerzo posteriores a la sesión. El documento del juego
// promete: "recibirás por la app microlearnings de refuerzo enfocados en tu
// dimensión más débil en las próximas semanas".
//
// Cada persona recibe la secuencia de SU dimensión más débil, una pieza por
// semana durante 4 semanas.

export const MICROLEARNINGS = {
  cabeza: [
    {
      week: 1,
      format: 'Lectura · 4 min',
      title: 'Decidir con el 70% de la información',
      body: 'Esperar el 100% de los datos casi siempre llega tarde. Aprende a nombrar explícitamente qué te falta, qué asumes y qué revisarías después.',
      action: 'En tu próxima decisión, escribe en una línea el supuesto más riesgoso que estás aceptando.'
    },
    {
      week: 2,
      format: 'Ejercicio · 10 min',
      title: 'El criterio antes que la opción',
      body: 'Cuando el equipo discute opciones sin acordar criterios, la discusión se vuelve de gustos. Define primero cómo van a comparar.',
      action: 'Antes de la próxima reunión de decisión, manda 3 criterios por escrito.'
    },
    {
      week: 3,
      format: 'Video · 6 min',
      title: 'Hacer visible tu razonamiento',
      body: 'Tu análisis puede ser impecable y aun así el equipo sentirse excluido, porque solo ven la conclusión y no el camino.',
      action: 'Explica en voz alta el "por qué" detrás de una decisión que ya tomaste.'
    },
    {
      week: 4,
      format: 'Reto · 1 semana',
      title: 'Una decisión con datos del equipo',
      body: 'Pide a dos personas el dato que ellas creen más relevante antes de cerrar un tema. El análisis se enriquece y la decisión se sostiene mejor.',
      action: 'Documenta qué cambió en tu decisión al incorporar ese dato.'
    }
  ],
  corazon: [
    {
      week: 1,
      format: 'Lectura · 4 min',
      title: 'Preguntar antes de resolver',
      body: 'Cuando alguien trae un problema, el reflejo es solucionarlo. Muchas veces lo que necesita primero es sentirse escuchado.',
      action: 'Esta semana, ante un problema que te traigan, haz dos preguntas antes de proponer nada.'
    },
    {
      week: 2,
      format: 'Ejercicio · 10 min',
      title: 'Honestidad con cuidado',
      body: 'Decir la verdad y cuidar a la persona no son opuestos. La fórmula: hecho concreto, impacto real, pregunta abierta.',
      action: 'Prepara con esa estructura una conversación que vienes postergando.'
    },
    {
      week: 3,
      format: 'Video · 6 min',
      title: 'Leer el clima del equipo',
      body: 'El desgaste casi nunca se anuncia. Aparece en el tono, en el silencio en las reuniones y en quién dejó de proponer.',
      action: 'Identifica a la persona que menos ha hablado este mes y agenda 15 minutos con ella.'
    },
    {
      week: 4,
      format: 'Reto · 1 semana',
      title: 'Reconocimiento específico',
      body: 'El reconocimiento genérico no cala. El específico sí: nombra la conducta exacta y el efecto que tuvo.',
      action: 'Reconoce públicamente a una persona nombrando qué hizo y qué cambió gracias a eso.'
    }
  ],
  manos: [
    {
      week: 1,
      format: 'Lectura · 4 min',
      title: 'De la conversación al compromiso',
      body: 'Una reunión sin acción concreta es una conversación agradable. Cerrar implica nombrar qué, quién y cuándo.',
      action: 'Termina tus próximas tres reuniones con un acuerdo escrito de una línea.'
    },
    {
      week: 2,
      format: 'Ejercicio · 10 min',
      title: 'El primer paso en 48 horas',
      body: 'Los planes grandes se diluyen. Lo que sostiene el cambio es un primer paso pequeño que ocurre esta semana.',
      action: 'Toma el proyecto más estancado y define un paso que puedas cerrar en 48 horas.'
    },
    {
      week: 3,
      format: 'Video · 6 min',
      title: 'Delegar sin soltar el rumbo',
      body: 'Ejecutar todo tú mismo es el camino rápido al cuello de botella. Delegar es definir el resultado, no el procedimiento.',
      action: 'Delega una tarea definiendo el resultado esperado y la fecha, no el cómo.'
    },
    {
      week: 4,
      format: 'Reto · 1 semana',
      title: 'Cerrar antes de abrir',
      body: 'Acumular frentes abiertos da sensación de avance sin resultados. Cierra algo antes de empezar lo siguiente.',
      action: 'Elige un pendiente viejo y ciérralo esta semana antes de abrir uno nuevo.'
    }
  ]
}

export function microlearningsFor(dimensionId) {
  return MICROLEARNINGS[dimensionId] || []
}

// Calcula el estado de la secuencia a partir de la fecha de cierre de la sesión:
// una pieza por semana.
export function microlearningPlan(dimensionId, startedAt) {
  const pieces = microlearningsFor(dimensionId)
  if (!startedAt) return pieces.map((p) => ({ ...p, unlocked: false, unlocksAt: null }))

  const start = new Date(startedAt)
  const now = Date.now()
  return pieces.map((p) => {
    const unlocksAt = new Date(start)
    unlocksAt.setDate(unlocksAt.getDate() + (p.week - 1) * 7)
    return { ...p, unlocksAt: unlocksAt.toISOString(), unlocked: unlocksAt.getTime() <= now }
  })
}
