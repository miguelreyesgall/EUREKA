import { DISC_STYLES, MIN_STYLES_TO_PLACE, distinctStyles } from './discGame'

// Logros de gamificacion: se derivan de las rondas jugadas, no se guardan.

export const BADGES = {
  perfecto: { id: 'perfecto', icon: '💎', label: 'Pleno perfecto', desc: 'Colocó ficha en todas las rondas' },
  pleno_disc: { id: 'pleno_disc', icon: '🌈', label: 'Pleno DISC', desc: 'Una ronda con los 4 estilos participando' },
  racha: { id: 'racha', icon: '🔥', label: 'En racha', desc: '3 o más rondas seguidas colocando ficha' },
  remontada: { id: 'remontada', icon: '📈', label: 'Remontada', desc: 'Falló la primera ronda y terminó con mayoría de fichas' },
  mayoria: { id: 'mayoria', icon: '🎯', label: 'Puntería', desc: 'Más de la mitad de las fichas colocadas' },
  constante: { id: 'constante', icon: '🧭', label: 'Equipo completo', desc: 'Todos los integrantes participaron al menos una vez' }
}

// Racha mas larga de rondas consecutivas con ficha colocada.
export function longestStreak(rounds) {
  let best = 0
  let current = 0
  for (const r of rounds) {
    current = r.placed ? current + 1 : 0
    if (current > best) best = current
  }
  return best
}

export function currentStreak(rounds) {
  let current = 0
  for (const r of rounds) current = r.placed ? current + 1 : 0
  return current
}

export function teamBadges(team, rounds) {
  const badges = []
  if (!rounds.length) return badges

  const placed = rounds.filter((r) => r.placed).length

  if (placed === rounds.length && rounds.length > 0) badges.push(BADGES.perfecto)
  if (rounds.some((r) => distinctStyles(team, r.participantIds || []).length === DISC_STYLES.length)) {
    badges.push(BADGES.pleno_disc)
  }
  if (longestStreak(rounds) >= 3) badges.push(BADGES.racha)
  if (!rounds[0]?.placed && placed > rounds.length / 2) badges.push(BADGES.remontada)
  if (placed > rounds.length / 2 && placed !== rounds.length) badges.push(BADGES.mayoria)

  const participated = new Set(rounds.flatMap((r) => r.participantIds || []))
  if (team.participants.length > 0 && team.participants.every((p) => participated.has(p.id))) {
    badges.push(BADGES.constante)
  }

  return badges
}

// Puntos de gamificacion: ficha colocada = 100, bonus por estilos extra y rachas.
export function teamPoints(team, rounds) {
  let points = 0
  let streak = 0
  for (const r of rounds) {
    if (!r.placed) {
      streak = 0
      continue
    }
    streak += 1
    const styles = distinctStyles(team, r.participantIds || []).length
    points += 100
    points += (styles - MIN_STYLES_TO_PLACE) * 25 // bonus por sumar el 4o estilo
    if (streak >= 2) points += 25 * (streak - 1) // bonus de racha
  }
  return points
}
