import { useMemo, useSyncExternalStore } from 'react'
import { distinctStyles, MIN_STYLES_TO_PLACE } from './discGame'

// -----------------------------------------------------------------------------
// Capa de datos del demo. Todo vive en localStorage: no hay backend real.
// Estructura:
//   companies: [{ id, name, email, password, createdAt }]
//   sessionAuth: companyId | null   (empresa "logueada")
//   sessions: [{
//     id, companyId, gameId: 'punto-de-encuentro', name, purpose,
//     createdAt, completedAt, status: 'draft' | 'in_progress' | 'completed',
//     teams: [{ id, name, participants: [{ id, name, role, style: 'D'|'I'|'S'|'C' }] }],
//     currentDeckIndex: 0..6   (6 = fase de cierre),
//     rounds: [{ deckId, cardText, teamId, participantIds: [], placed, at }],
//     closingAnswers: [{ deckId, answer }]
//   }]
// -----------------------------------------------------------------------------

const KEY = 'eureka.demo.v2'

const seed = () => ({
  companies: [],
  sessionAuth: null,
  sessions: []
})

let state = load()
const listeners = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    return { ...seed(), ...JSON.parse(raw) }
  } catch {
    return seed()
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / private mode */
  }
}

function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : updater
  persist()
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Sincroniza entre pestañas del mismo navegador.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load()
      listeners.forEach((l) => l())
    }
  })
}

const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useStore(selector = (s) => s) {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  )
}

export function useCurrentCompany() {
  return useStore((s) => s.companies.find((c) => c.id === s.sessionAuth) || null)
}

export function useCompanySessions() {
  // Derivamos con useMemo: si devolviéramos un array nuevo dentro del selector de
  // useSyncExternalStore, React entraría en un loop ("getSnapshot should be cached").
  const sessions = useStore((s) => s.sessions)
  const authId = useStore((s) => s.sessionAuth)
  return useMemo(
    () =>
      sessions
        .filter((sess) => sess.companyId === authId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [sessions, authId]
  )
}

export function useSession(sessionId) {
  return useStore((s) => s.sessions.find((sess) => sess.id === sessionId) || null)
}

// ---------------------------------------------------------------------------
// Acciones - auth
// ---------------------------------------------------------------------------

export const actions = {
  register({ name, email, password }) {
    const exists = state.companies.some((c) => c.email.toLowerCase() === email.toLowerCase())
    if (exists) return { error: 'Ya existe una cuenta con ese correo.' }
    const company = { id: uid('co'), name, email, password, createdAt: new Date().toISOString() }
    setState((s) => ({ ...s, companies: [...s.companies, company], sessionAuth: company.id }))
    return { company }
  },

  login({ email, password }) {
    const company = state.companies.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    )
    if (!company) return { error: 'Credenciales incorrectas.' }
    setState((s) => ({ ...s, sessionAuth: company.id }))
    return { company }
  },

  logout() {
    setState((s) => ({ ...s, sessionAuth: null }))
  },

  // ---------------------------------------------------------------------------
  // Acciones - sesiones de "Punto de Encuentro"
  // ---------------------------------------------------------------------------

  createDiscSession({ name, purpose, teams }) {
    const session = {
      id: uid('se'),
      companyId: state.sessionAuth,
      gameId: 'punto-de-encuentro',
      name,
      purpose: purpose || '',
      createdAt: new Date().toISOString(),
      completedAt: null,
      status: 'draft',
      teams: teams.map((t) => ({
        id: uid('te'),
        name: t.name.trim(),
        participants: t.participants.map((p) => ({
          id: uid('pa'),
          name: p.name.trim(),
          role: p.role.trim() || 'Miembro del equipo',
          style: p.style || null
        }))
      })),
      currentDeckIndex: 0,
      rounds: [],
      closingAnswers: []
    }
    setState((s) => ({ ...s, sessions: [...s.sessions, session] }))
    return session
  },

  updateSession(sessionId, patch) {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((sess) => (sess.id === sessionId ? { ...sess, ...patch } : sess))
    }))
  },

  startSession(sessionId) {
    this.updateSession(sessionId, { status: 'in_progress', currentDeckIndex: 0 })
  },

  recordRoundResult(sessionId, { deckId, cardText, teamId, participantIds }) {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((sess) => {
        if (sess.id !== sessionId) return sess
        const team = sess.teams.find((t) => t.id === teamId)
        const placed = distinctStyles(team, participantIds).length >= MIN_STYLES_TO_PLACE
        const round = { deckId, cardText, teamId, participantIds, placed, at: new Date().toISOString() }
        return { ...sess, rounds: [...sess.rounds, round] }
      })
    }))
  },

  advanceDeck(sessionId) {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId ? { ...sess, currentDeckIndex: Math.min(6, sess.currentDeckIndex + 1) } : sess
      )
    }))
  },

  saveClosingAnswers(sessionId, closingAnswers) {
    this.updateSession(sessionId, { closingAnswers })
  },

  completeSession(sessionId) {
    this.updateSession(sessionId, { status: 'completed', completedAt: new Date().toISOString() })
  },

  deleteSession(sessionId) {
    setState((s) => ({ ...s, sessions: s.sessions.filter((sess) => sess.id !== sessionId) }))
  },

  // Carga una empresa + sesiones de ejemplo ya jugadas, para mostrar el reporte al toque.
  loadDemoData() {
    const demo = buildDemoCompany()
    setState((s) => {
      const withoutDemo = {
        companies: s.companies.filter((c) => c.id !== demo.company.id),
        sessions: s.sessions.filter((sess) => sess.companyId !== demo.company.id)
      }
      return {
        ...s,
        companies: [...withoutDemo.companies, demo.company],
        sessions: [...withoutDemo.sessions, ...demo.sessions],
        sessionAuth: demo.company.id
      }
    })
    return demo
  },

  reset() {
    setState(seed())
  }
}

// ---------------------------------------------------------------------------
// Datos de ejemplo
// ---------------------------------------------------------------------------

function buildDemoCompany() {
  const companyId = 'co_demo_nova'
  const company = {
    id: companyId,
    name: 'Nova Labs',
    email: 'demo@novalabs.io',
    password: 'demo',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString()
  }

  const teamNorte = {
    id: 'te_norte',
    name: 'Equipo Norte',
    participants: [
      { id: 'pa_n1', name: 'Valentina Ríos', role: 'Product Manager', style: 'I' },
      { id: 'pa_n2', name: 'Mateo Duarte', role: 'Tech Lead', style: 'D' },
      { id: 'pa_n3', name: 'Camila Fernández', role: 'Diseñadora UX', style: 'S' },
      { id: 'pa_n4', name: 'Joaquín Bravo', role: 'Data Analyst', style: 'C' }
    ]
  }
  const teamSur = {
    id: 'te_sur',
    name: 'Equipo Sur',
    participants: [
      { id: 'pa_s1', name: 'Renata Solís', role: 'QA Engineer', style: 'C' },
      { id: 'pa_s2', name: 'Diego Paredes', role: 'Growth Lead', style: 'D' },
      { id: 'pa_s3', name: 'Sofía Márquez', role: 'Performance Marketing', style: 'I' },
      { id: 'pa_s4', name: 'Tomás Iglesias', role: 'Lifecycle & CRM', style: 'S' }
    ]
  }

  const deckOrder = ['feedback', 'presion', 'cambio', 'conflicto', 'liderazgo', 'comunicacion']
  const cardByDeck = {
    feedback: 'Un compañero entregó un trabajo con errores evidentes frente a todo el equipo. Denle feedback ahí mismo, sin humillarlo.',
    presion: 'Faltan 2 horas para la entrega y se cayó el proveedor clave. Decidan el plan B en el tiempo del reto.',
    cambio: 'La empresa anuncia una reestructuración que afecta al equipo. Definan cómo comunicarlo a los demás.',
    conflicto: 'Dos integrantes del equipo llevan días sin hablarse por una decisión técnica. Medien el conflicto ahora.',
    liderazgo: 'El equipo se queda sin líder a mitad de un proyecto crítico. Decidan quién asume y qué necesita cada quien.',
    comunicacion: 'Dos áreas entendieron objetivos distintos para el mismo proyecto. Alineen el mensaje en los próximos 5 minutos.'
  }

  // Norte logra colocar ficha en 5 de 6 rondas, Sur en 3 de 6.
  const norteHits = [true, true, false, true, true, true]
  const surHits = [true, false, true, false, true, false]

  const rounds = []
  deckOrder.forEach((deckId, i) => {
    rounds.push({
      deckId,
      cardText: cardByDeck[deckId],
      teamId: teamNorte.id,
      participantIds: norteHits[i]
        ? teamNorte.participants.map((p) => p.id)
        : teamNorte.participants.slice(0, 2).map((p) => p.id),
      placed: norteHits[i],
      at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12 + i * 1000 * 60 * 8).toISOString()
    })
    rounds.push({
      deckId,
      cardText: cardByDeck[deckId],
      teamId: teamSur.id,
      participantIds: surHits[i]
        ? teamSur.participants.map((p) => p.id)
        : teamSur.participants.slice(0, 2).map((p) => p.id),
      placed: surHits[i],
      at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12 + i * 1000 * 60 * 8 + 1000 * 60 * 4).toISOString()
    })
  })

  const closingAnswers = [
    { deckId: 'feedback', answer: 'Aprendimos a decir las cosas difíciles sin esperar a la retro formal.' },
    { deckId: 'presion', answer: 'El estilo Dominante tomó la vocería casi siempre que el tiempo apretaba.' },
    { deckId: 'cambio', answer: 'La próxima vez queremos avisar antes al equipo, no solo reaccionar.' },
    { deckId: 'conflicto', answer: 'Nos costó más proponer soluciones que escuchar el problema completo.' },
    { deckId: 'liderazgo', answer: 'Camila lideró dos rondas sin tener el rol formal de líder.' },
    { deckId: 'comunicacion', answer: 'Nos entendimos mejor cuando una sola persona resumía antes de decidir.' }
  ]

  const completedSession = {
    id: 'se_demo_q3',
    companyId,
    gameId: 'punto-de-encuentro',
    name: 'Retro trimestral · Squad Producto',
    purpose: 'Cerrar el trimestre y detectar dónde reforzar al equipo antes del próximo ciclo.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12 + 1000 * 60 * 70).toISOString(),
    status: 'completed',
    teams: [teamNorte, teamSur],
    currentDeckIndex: 6,
    rounds,
    closingAnswers
  }

  const draftSession = {
    id: 'se_demo_onb',
    companyId,
    gameId: 'punto-de-encuentro',
    name: 'Onboarding · Nuevo squad Growth',
    purpose: 'Primera dinámica del equipo recién formado para establecer una línea base.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    completedAt: null,
    status: 'draft',
    teams: [
      {
        id: 'te_growth',
        name: 'Equipo Growth',
        participants: [
          { id: 'pa_g1', name: 'Lucía Ferreira', role: 'Growth PM', style: 'I' },
          { id: 'pa_g2', name: 'Simón Aguilar', role: 'Performance', style: 'D' },
          { id: 'pa_g3', name: 'Martina Cabrera', role: 'Contenido', style: 'S' }
        ]
      }
    ],
    currentDeckIndex: 0,
    rounds: [],
    closingAnswers: []
  }

  return { company, sessions: [completedSession, draftSession] }
}

export { uid }
