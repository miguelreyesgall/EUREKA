// Helpers que funcionan con cualquier juego: Código DISC guarda la gente en
// equipos, Mando Íntegro la guarda plana en `participants`.

export function sessionPeople(session) {
  if (session?.participants?.length) return session.participants
  return (session?.teams || []).flatMap((t) => t.participants || [])
}

export function sessionTeamCount(session) {
  return session?.teams?.length || 0
}

// Texto corto de composición, para las listas de sesiones.
export function sessionComposition(session) {
  const people = sessionPeople(session).length
  const teams = sessionTeamCount(session)
  if (teams) return `${teams} equipos · ${people} personas`
  return `${people} ${people === 1 ? 'líder' : 'líderes'}`
}

// Progreso 0..1 de la partida, sea cual sea el juego.
export function sessionProgress(session) {
  if (session?.gameId === 'mando-integro') return Math.min(1, (session.position ?? 0) / 18)
  return Math.min(1, (session?.currentDeckIndex ?? 0) / 6)
}
