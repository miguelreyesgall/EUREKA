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
