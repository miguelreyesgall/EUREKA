import { computeDiscReport } from './discGame'

// Agrega participantes a traves de todas las sesiones de la empresa. Como cada
// sesion crea participantes con id propio, agrupamos por nombre (normalizado)
// para simular un "directorio de personas" que juega distintas dinamicas.

const topKey = (counts) => Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

export function aggregatePeople(sessions) {
  const byName = new Map()

  for (const session of sessions) {
    if (!session.teams?.length) continue
    const report = session.status === 'completed' ? computeDiscReport(session) : null

    for (const team of session.teams) {
      for (const p of team.participants) {
        const key = p.name.trim().toLowerCase()
        if (!byName.has(key)) byName.set(key, { name: p.name, roles: {}, styles: {}, sessions: [] })
        const entry = byName.get(key)
        entry.roles[p.role] = (entry.roles[p.role] || 0) + 1
        if (p.style) entry.styles[p.style] = (entry.styles[p.style] || 0) + 1

        const personReport = report?.people.find((pp) => pp.id === p.id)
        entry.sessions.push({
          sessionId: session.id,
          sessionName: session.name,
          teamName: team.name,
          status: session.status,
          date: session.completedAt || session.createdAt,
          style: p.style,
          contributedCount: personReport?.contributedCount ?? null,
          successfulCount: personReport?.successfulCount ?? null
        })
      }
    }
  }

  return [...byName.values()]
    .map((e) => {
      const sessions = e.sessions.sort((a, b) => new Date(b.date) - new Date(a.date))
      return {
        name: e.name,
        role: topKey(e.roles),
        style: topKey(e.styles),
        sessionsCount: sessions.length,
        totalSuccessful: sessions.reduce((n, s) => n + (s.successfulCount || 0), 0),
        totalContributed: sessions.reduce((n, s) => n + (s.contributedCount || 0), 0),
        lastPlayed: sessions[0]?.date,
        sessions
      }
    })
    .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
}
