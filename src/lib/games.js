// Catalogo de juegos del marketplace. Solo "punto-de-encuentro" es funcional
// en este demo; el resto se muestra como "Próximamente" (relleno visual).

export const GAMES = [
  {
    id: 'punto-de-encuentro',
    name: 'Punto de Encuentro',
    tagline: 'Estilos DISC en acción, resolviendo retos reales bajo presión de equipo.',
    description:
      'Cada jugador recibe una ficha de identidad (Dominante, Influyente, Estable o Cauteloso). Los equipos enfrentan retos de feedback, presión, cambio, conflicto, liderazgo y comunicación, y solo colocan su ficha en el punto de encuentro si al menos 3 estilos participaron visiblemente en la solución.',
    category: 'Liderazgo situacional · DISC',
    icon: '🎯',
    color: '#6366f1',
    status: 'available'
  },
  {
    id: 'pulso-de-equipo',
    name: 'Pulso de Equipo',
    tagline: '360° de fortalezas y áreas de mejora entre pares, carta a carta.',
    description:
      'Cada participante se auto-evalúa en competencias clave y reparte cartas de "fortaleza" y "a mejorar" a sus compañeros, revelando puntos ciegos del equipo.',
    category: 'Feedback 360°',
    icon: '🎴',
    color: '#14b8a6',
    status: 'coming_soon'
  },
  {
    id: 'rally-de-decisiones',
    name: 'Rally de Decisiones',
    tagline: 'Decisiones rápidas en equipo con el reloj corriendo en contra.',
    description:
      'Una carrera de tableros donde cada estación plantea una decisión de negocio con tiempo límite y recursos escasos.',
    category: 'Toma de decisiones',
    icon: '🏁',
    color: '#f59e0b',
    status: 'coming_soon'
  },
  {
    id: 'puente-de-cristal',
    name: 'Puente de Cristal',
    tagline: 'Construir confianza cuando un solo paso en falso cuesta caro.',
    description:
      'Retos de colaboración con información incompleta: cada persona ve solo una parte del mapa y el equipo debe confiar para avanzar.',
    category: 'Confianza y colaboración',
    icon: '🌉',
    color: '#f43f5e',
    status: 'coming_soon'
  }
]

export const GAME_MAP = Object.fromEntries(GAMES.map((g) => [g.id, g]))
