// Catalogo real de productos gamificados de Eureka (portafolio V2).
//
//   kind 'propio'  -> producto digital de Eureka, jugable en la plataforma
//   kind 'alianza' -> kit fisico en alianza con Formactiva, se solicita
//
// Los dos juegos propios son los unicos con motor digital: Codigo DISC y
// Mando Integro. El resto son kits fisicos del catalogo.

export const GAMES = [
  {
    id: 'codigo-disc',
    name: 'Código DISC',
    tagline: 'Descifrando los comportamientos de tu equipo.',
    description:
      'Cada jugador recibe una ficha de identidad (Dominante, Influyente, Estable o Cauteloso). Los equipos enfrentan retos de feedback, presión, cambio, conflicto, liderazgo y comunicación, y solo colocan su ficha en el punto de encuentro si al menos 3 estilos participaron visiblemente en la solución.',
    category: 'Comportamiento · DISC',
    icon: '🎯',
    color: '#6366f1',
    kind: 'propio',
    status: 'available'
  },
  {
    id: 'mando-integro',
    name: 'Mando Íntegro',
    tagline: 'El liderazgo no se manda, se equilibra.',
    description:
      'Un sendero de 18 casillas de la Base a la Cumbre. En cada turno un Líder distinto resuelve un dilema eligiendo Cabeza, Corazón o Manos, y la Balanza del equipo se inclina. Solo avanzan más rápido quienes mantienen las tres dimensiones en equilibrio.',
    category: 'Liderazgo · Cabeza, Corazón y Manos',
    icon: '👑',
    color: '#0ea5e9',
    kind: 'propio',
    status: 'available'
  },
  {
    id: 'reino-seguro',
    name: 'Reino Seguro',
    tagline: 'Seguridad y salud en el trabajo.',
    description:
      'Tablero de hexágonos donde los equipos recorren los riesgos del lugar de trabajo y construyen una cultura de prevención. Kit físico en alianza con Formactiva.',
    category: 'Seguridad y salud en el trabajo',
    icon: '🛡️',
    color: '#f59e0b',
    kind: 'alianza',
    partner: 'Formactiva',
    status: 'physical'
  },
  {
    id: 'podium',
    name: 'Podium',
    tagline: 'El juego del conocimiento.',
    description:
      'Carrera de preguntas y retos para afianzar conocimiento técnico o normativo de forma competitiva. Kit físico en alianza con Formactiva.',
    category: 'Gestión del conocimiento',
    icon: '🏁',
    color: '#84cc16',
    kind: 'alianza',
    partner: 'Formactiva',
    status: 'physical'
  },
  {
    id: 'navegantes',
    name: 'Navegantes de la Transformación',
    tagline: 'Cambio organizacional.',
    description:
      'Kit de cambio organizacional que acompaña a los equipos a atravesar la incertidumbre de una transformación. Kit físico en alianza con Formactiva.',
    category: 'Cambio organizacional',
    icon: '⛵',
    color: '#14b8a6',
    kind: 'alianza',
    partner: 'Formactiva',
    status: 'physical'
  },
  {
    id: 'via-segura',
    name: 'Vía Segura',
    tagline: 'Seguridad vial y manejo de hábitos en la vía.',
    description:
      'Experiencia de seguridad vial alineada al PESV, para equipos que se mueven en carretera. Kit físico en alianza con Formactiva.',
    category: 'Seguridad vial · PESV',
    icon: '🚦',
    color: '#f43f5e',
    kind: 'alianza',
    partner: 'Formactiva',
    status: 'physical'
  },
  {
    id: 'kit-facilitador',
    name: 'Kit del Facilitador',
    tagline: 'Todo lo que un formador necesita en una maleta.',
    description:
      'Set de materiales y dinámicas listas para que el formador conduzca sesiones de alto impacto. Kit físico en alianza con Formactiva.',
    category: 'Herramientas de facilitación',
    icon: '🎒',
    color: '#8b5cf6',
    kind: 'alianza',
    partner: 'Formactiva',
    status: 'physical'
  }
]

export const GAME_MAP = Object.fromEntries(GAMES.map((g) => [g.id, g]))

export const PLAYABLE_GAMES = GAMES.filter((g) => g.status === 'available')
export const OWN_GAMES = GAMES.filter((g) => g.kind === 'propio')
export const PARTNER_GAMES = GAMES.filter((g) => g.kind === 'alianza')

export const isPlayable = (gameId) => GAME_MAP[gameId]?.status === 'available'
