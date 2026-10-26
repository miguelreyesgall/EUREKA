import { computeDiscReport } from './discGame'
import { sessionPeople } from './sessions'

// Directorio de personas a traves de todas las sesiones de la empresa, sin
// importar el juego. Como cada sesion crea participantes con id propio,
// agrupamos por nombre normalizado.
//
// Una misma persona puede tener dos perfiles distintos:
//   style     -> su ficha DISC en Código DISC (D/I/S/C)
//   dimension -> su dimension dominante en Mando Íntegro (cabeza/corazon/manos)

const topKey = (counts) => Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

export function aggregatePeople(sessions) {
  const byName = new Map()

  for (const session of sessions) {
    const people = sessionPeople(session)
    if (!people.length) continue

    const isDisc = session.gameId === 'codigo-disc'
    const report = isDisc && session.status === 'completed' ? computeDiscReport(session) : null

    for (const p of people) {
      const key = p.name.trim().toLowerCase()
      if (!byName.has(key)) {
        byName.set(key, { name: p.name, roles: {}, styles: {}, dimensions: {}, sessions: [] })
      }
      const entry = byName.get(key)
      entry.roles[p.role] = (entry.roles[p.role] || 0) + 1
      if (p.style) entry.styles[p.style] = (entry.styles[p.style] || 0) + 1
      if (p.diagnostic?.dominant) {
        entry.dimensions[p.diagnostic.dominant] = (entry.dimensions[p.diagnostic.dominant] || 0) + 1
      }

      const personReport = report?.people.find((pp) => pp.id === p.id)
      const team = (session.teams || []).find((t) => t.participants.some((x) => x.id === p.id))
      const mandoTurns = (session.rounds || []).filter((r) => r.leaderId === p.id)

      entry.sessions.push({
        sessionId: session.id,
        sessionName: session.name,
        gameId: session.gameId,
        teamName: team?.name || null,
        status: session.status,
        date: session.completedAt || session.createdAt,
        style: p.style || null,
        dimension: p.diagnostic?.dominant || null,
        contributedCount: personReport?.contributedCount ?? (mandoTurns.length || null),
        successfulCount: personReport?.successfulCount ?? (mandoTurns.filter((r) => r.balanced).length || null)
      })
    }
  }

  return [...byName.values()]
    .map((e) => {
      const sessions = e.sessions.sort((a, b) => new Date(b.date) - new Date(a.date))
      return {
        name: e.name,
        role: topKey(e.roles),
        style: topKey(e.styles),
        dimension: topKey(e.dimensions),
        sessionsCount: sessions.length,
        totalSuccessful: sessions.reduce((n, s) => n + (s.successfulCount || 0), 0),
        totalContributed: sessions.reduce((n, s) => n + (s.contributedCount || 0), 0),
        lastPlayed: sessions[0]?.date,
        sessions
      }
    })
    .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
}
