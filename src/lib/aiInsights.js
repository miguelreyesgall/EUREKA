import { DECKS, DISC_STYLES } from './discGame'

// Analisis "generado por IA" para el demo: es determinista (mismo insumo, mismo
// resultado) pero usa un generador pseudo-aleatorio sembrado con el id de la
// sesion para variar cifras de "confianza" y proyecciones entre sesiones.
// No hay ningun modelo real detras: es contenido simulado para mostrar el
// producto terminado.

function seedFrom(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pct = (n) => Math.round(n * 100)

export function generateAIInsights(session, report) {
  const rand = mulberry32(seedFrom(session.id))
  const confidence = Math.round(90 + rand() * 8) // 90-98
  const signals = Math.round(40 + report.totalRounds * (8 + rand() * 6)) // ~escala con rondas jugadas

  const successRate = report.totalRounds ? report.totalPlaced / report.totalRounds : 0
  const cohesionToday = Math.round(35 + successRate * 60) // 35-95

  // --- Radar: participacion real por estilo vs. un equipo perfectamente balanceado ---
  const totalStyleHits = Object.values(report.styleParticipation).reduce((a, b) => a + b, 0)
  const radar = DISC_STYLES.map((s) => ({
    style: s.label,
    equipo: totalStyleHits ? pct((report.styleParticipation[s.id] || 0) / totalStyleHits) : 0,
    balanceIdeal: 25
  }))

  // --- Proyeccion simulada de cohesion si se aplican las recomendaciones ---
  const projection = [
    { label: 'Hoy', cohesion: cohesionToday },
    { label: '+4 semanas', cohesion: Math.min(96, cohesionToday + Math.round(8 + rand() * 6)) },
    { label: '+8 semanas', cohesion: Math.min(98, cohesionToday + Math.round(16 + rand() * 8)) }
  ]

  // --- Mazo mas dificil (menor tasa de exito) ---
  const byDeck = DECKS.map((d) => {
    const rounds = report.roundDetails.filter((r) => r.deckId === d.id)
    const placed = rounds.filter((r) => r.placed).length
    return { deck: d, rounds: rounds.length, placed, rate: rounds.length ? placed / rounds.length : null }
  }).filter((d) => d.rate !== null)
  const hardestDeck = [...byDeck].sort((a, b) => a.rate - b.rate)[0]
  const easiestDeck = [...byDeck].sort((a, b) => b.rate - a.rate)[0]

  const weakTeams = report.teamStats.filter((t) => !t.canEverPlace)
  const mvp = [...report.people].sort((a, b) => b.successfulCount - a.successfulCount)[0]

  const highlights = []
  if (report.topStyle?.count > 0) {
    highlights.push({
      icon: '🧠',
      title: 'Patrón dominante',
      body: `El estilo ${report.topStyle.label} apareció en el ${totalStyleHits ? pct(report.topStyle.count / totalStyleHits) : 0}% de las soluciones ganadoras: el equipo tiende a resolver apoyándose en ese modo de actuar.`
    })
  }
  if (mvp && mvp.successfulCount > 0) {
    highlights.push({
      icon: '⭐',
      title: 'MVP conductual',
      body: `${mvp.name} (${mvp.style?.label || 'sin ficha'}) participó de forma visible en ${mvp.successfulCount} de las fichas colocadas por ${mvp.teamName}.`
    })
  }
  if (hardestDeck) {
    highlights.push({
      icon: '⚠️',
      title: 'Fricción detectada',
      body: `El mazo "${hardestDeck.deck.label}" tuvo la tasa de éxito más baja (${pct(hardestDeck.rate)}%): es donde más costó sumar 3 estilos distintos en la solución.`
    })
  }
  if (weakTeams.length) {
    highlights.push({
      icon: '🧩',
      title: 'Riesgo estructural',
      body: `${weakTeams.map((t) => t.name).join(', ')} no ${weakTeams.length > 1 ? 'tienen' : 'tiene'} los 4 estilos DISC representados: hay un techo de fichas que nunca podrán colocar.`
    })
  } else if (easiestDeck) {
    highlights.push({
      icon: '💡',
      title: 'Fortaleza a explotar',
      body: `En "${easiestDeck.deck.label}" el equipo logró ${pct(easiestDeck.rate)}% de éxito: conviene usar ese patrón de colaboración como referencia para los demás retos.`
    })
  }

  const recommendations = []
  if (weakTeams.length) {
    recommendations.push('Rearma los equipos para asegurar los 4 estilos DISC en cada mesa antes de la próxima sesión.')
  }
  if (hardestDeck) {
    recommendations.push(`Dedica una dinámica corta de "${hardestDeck.deck.label}" antes del próximo Punto de Encuentro: fue el mazo con más bloqueos.`)
  }
  recommendations.push('Repite la dinámica en 6-8 semanas para comparar el índice de cohesión y validar si las recomendaciones tuvieron efecto.')
  if (report.topStyle) {
    recommendations.push(`Balancea la participación: invita activamente a los estilos distintos de ${report.topStyle.label.toLowerCase()} a proponer primero en la próxima ronda.`)
  }

  const summary = `Con ${signals} señales de comportamiento analizadas durante la sesión, el modelo estima un índice de cohesión actual de ${cohesionToday}/100. El equipo colocó ${report.totalPlaced} de ${report.totalRounds} fichas posibles (${pct(successRate)}% de efectividad), apoyándose sobre todo en el estilo ${report.topStyle?.label?.toLowerCase() || '—'}. El patrón sugiere una dinámica ${successRate >= 0.7 ? 'madura, con buena integración entre estilos' : successRate >= 0.45 ? 'en desarrollo, con oportunidades claras de mejora' : 'con fricciones relevantes para cruzar estilos bajo presión'}.`

  return { confidence, signals, cohesionToday, radar, projection, highlights, recommendations, summary }
}
