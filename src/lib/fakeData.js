import { DISC_STYLES } from './discGame'

// Banco de datos ficticios para rellenar el demo con un clic: nombres, roles,
// nombres/objetivos de sesión y respuestas de cierre. Nada de esto se envía a
// ningún lado, es puro relleno local para acelerar la demo.

export const FICTIONAL_NAMES = [
  'Ana Torres', 'Bruno Salas', 'Carla Núñez', 'Diego Ponce', 'Elena Rivas',
  'Franco Medina', 'Gabriela Soto', 'Héctor Villalba', 'Isabela Cruz', 'Joaquín Rey',
  'Karla Fuentes', 'Leandro Ibarra', 'Marina Cabrera', 'Nicolás Paredes', 'Olivia Reyes',
  'Pablo Guerrero', 'Renata Vidal', 'Santiago Molina', 'Tamara Vega', 'Ulises Campos',
  'Valeria Rojas', 'Walter Núñez', 'Ximena Ortiz', 'Yamil Sosa', 'Zoe Aranda',
  'Emilio Duarte', 'Fernanda Vera', 'Gustavo Lima', 'Antonia Bravo', 'Rodrigo Paz'
]

export const FICTIONAL_ROLES = [
  'Líder de equipo', 'Product Manager', 'Diseño UX', 'Desarrollo', 'Datos',
  'QA', 'Marketing', 'Operaciones', 'Ventas', 'Soporte', 'Finanzas', 'Recursos Humanos'
]

export const SESSION_NAME_SAMPLES = [
  'Retro trimestral · Squad Producto',
  'Kickoff de equipo · Nueva iniciativa',
  'Team building · Semana de integración',
  'Offsite anual · Liderazgo',
  'Onboarding · Equipo recién formado',
  'Cierre de sprint · Squad Growth'
]

export const PURPOSE_SAMPLES = [
  'Detectar cómo se distribuyen los estilos de liderazgo dentro del equipo.',
  'Fortalecer la confianza entre áreas que trabajan juntas hace poco.',
  'Cerrar el ciclo y ver qué patrones de comportamiento aparecieron bajo presión.',
  'Conocer al equipo recién formado antes de asignar roles definitivos.',
  'Practicar feedback y manejo de conflicto de forma segura.'
]

export const CLOSING_ANSWER_SAMPLES = {
  feedback: [
    'Aprendimos a decir las cosas difíciles sin esperar a la retro formal.',
    'Nos dimos cuenta de que damos mucho feedback positivo pero poco correctivo directo.',
    'El equipo prefiere el feedback en privado antes que frente a todos.'
  ],
  presion: [
    'El estilo Dominante tomó la vocería casi siempre que el tiempo apretaba.',
    'Bajo presión tendemos a decidir rápido y revisar después, para bien y para mal.',
    'Cuando el reloj corre, el equipo se apoya mucho en quien propone primero.'
  ],
  cambio: [
    'La próxima vez queremos avisar antes al equipo, no solo reaccionar.',
    'Nos cuesta soltar el plan original aunque ya no tenga sentido.',
    'El equipo se adapta rápido cuando entiende el "por qué" del cambio.'
  ],
  conflicto: [
    'Nos costó más proponer soluciones que escuchar el problema completo.',
    'Evitamos el conflicto directo más de lo que pensábamos antes del juego.',
    'Cuando alguien nombra el problema en voz alta, el equipo lo resuelve rápido.'
  ],
  liderazgo: [
    'Un integrante lideró varias rondas sin tener el rol formal de líder.',
    'El liderazgo se repartió más de lo esperado entre distintas personas.',
    'Nos falta dar espacio a que lideren los perfiles más callados del equipo.'
  ],
  comunicacion: [
    'Nos entendimos mejor cuando una sola persona resumía antes de decidir.',
    'Hablar todos a la vez fue lo que más nos hizo perder tiempo.',
    'La comunicación mejoró notablemente cuando alguien tomaba nota en voz alta.'
  ]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Genera `count` participantes ficticios con estilos DISC variados: los primeros
// 4 cubren D/I/S/C en orden aleatorio para asegurar diversidad, el resto se
// asigna al azar.
export function generateFictionalMembers(count) {
  const names = shuffle(FICTIONAL_NAMES).slice(0, count)
  const styles = shuffle(DISC_STYLES.map((s) => s.id))
  return names.map((name, i) => ({
    name,
    role: pickOne(FICTIONAL_ROLES),
    style: i < styles.length ? styles[i] : pickOne(DISC_STYLES.map((s) => s.id))
  }))
}

export const randomSessionName = () => pickOne(SESSION_NAME_SAMPLES)
export const randomPurpose = () => pickOne(PURPOSE_SAMPLES)

export function randomClosingAnswers(closingDeck) {
  return Object.fromEntries(closingDeck.map((c) => [c.deckId, pickOne(CLOSING_ANSWER_SAMPLES[c.deckId] || [''])]))
}

// ---------------------------------------------------------------------------
// Mando Íntegro
// ---------------------------------------------------------------------------

export const LEADER_ROLES = [
  'Gerente de Operaciones', 'Líder Comercial', 'Jefe de Talento Humano', 'Coordinador de Proyectos',
  'Gerente Financiero', 'Jefe de Planta', 'Líder de Tecnología', 'Director de Servicio'
]

export function generateFictionalLeaders(count) {
  const names = shuffle(FICTIONAL_NAMES).slice(0, count)
  const roles = shuffle(LEADER_ROLES)
  return names.map((name, i) => ({ name, role: roles[i % roles.length] }))
}

const MANDO_CLOSING_SAMPLES = {
  decisiones: [
    'En el dilema de los datos incompletos casi todos queríamos decidir solos.',
    'Nos dimos cuenta de que decidimos rápido para no sostener la incomodidad.'
  ],
  feedback: [
    'Nos costó sostener honestidad y cuidado en la misma frase.',
    'Fue más fácil dar el dato duro que reconocer la emoción del otro.'
  ],
  cambio: [
    'Cuando todo cambia rápido se nos olvida primero el Corazón.',
    'Saltamos a ejecutar sin explicar el porqué del cambio.'
  ],
  conflicto: [
    'Nos costó más llegar a una acción concreta que entender los hechos.',
    'Evitamos nombrar el conflicto hasta que ya era tarde.'
  ],
  hibrido: [
    'La distancia nos empujó a resolver por Manos, sin preguntar cómo estaban.',
    'El equipo remoto quedó fuera de las decisiones sin que nos diéramos cuenta.'
  ],
  bienestar: [
    'Usamos poco la Cabeza para cuidar nuestro propio bienestar como líderes.',
    'Reconocemos el esfuerzo del equipo, pero no ajustamos el ritmo.'
  ],
  general: [
    'Necesitamos fortalecer el Corazón: preguntar antes de resolver.',
    'Esta semana toca poner Manos: cerrar lo que venimos postergando.'
  ]
}

const MATRIX_SAMPLES = {
  autoconocimiento: [
    'Bajo presión me voy directo a los datos y dejo de preguntar.',
    'Descubrí que evito el conflicto directo más de lo que creía.',
    'Cuando aprieta el tiempo decido sola y luego informo.'
  ],
  reconocimiento: [
    'Ver a alguien validar la emoción sin frenar la decisión me abrió los ojos.',
    'Me sirvió ver cómo otro cierra siempre con una acción concreta.',
    'Alguien de la mesa preguntó algo que yo había dado por obvio.'
  ],
  aplicacion: [
    'El dilema de automatizar el proceso es literalmente lo que tengo esta semana.',
    'La conversación de la promoción que vengo postergando.',
    'Tengo dos personas de mi equipo sin hablarse hace semanas.'
  ],
  compromiso: [
    'Preguntar antes de concluir en las reuniones de operación.',
    'Tener la conversación difícil antes del viernes.',
    'Cerrar un pendiente viejo antes de abrir uno nuevo.'
  ]
}

const COMMITMENT_SAMPLES = {
  cabeza: [
    'Escribir los 3 criterios de decisión antes del próximo comité.',
    'Pedir el dato que falta antes de cerrar la propuesta del cliente.'
  ],
  corazon: [
    'Abrir cada comité preguntando cómo llega el equipo, antes de los indicadores.',
    'Agendar 15 minutos con la persona que menos ha hablado este mes.'
  ],
  manos: [
    'Definir el primer paso del proyecto estancado y ejecutarlo en 48 horas.',
    'Cerrar las próximas tres reuniones con un acuerdo escrito.'
  ]
}

export function randomMandoClosing(session) {
  const closingAnswers = Object.fromEntries(
    Object.entries(MANDO_CLOSING_SAMPLES).map(([k, v]) => [k, pickOne(v)])
  )

  const learningMatrix = {}
  for (const p of session.participants) {
    learningMatrix[p.id] = Object.fromEntries(
      Object.entries(MATRIX_SAMPLES).map(([k, v]) => [k, pickOne(v)])
    )
  }

  const inDays = (n) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
  }

  const commitments = session.participants.map((p, i) => {
    const dimension = p.diagnostic?.weakest || pickOne(['cabeza', 'corazon', 'manos'])
    return {
      participantId: p.id,
      dimension,
      text: pickOne(COMMITMENT_SAMPLES[dimension] || COMMITMENT_SAMPLES.corazon),
      reviewDate: inDays(3 + i)
    }
  })

  return { closingAnswers, learningMatrix, commitments }
}
