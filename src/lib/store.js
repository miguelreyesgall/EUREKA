import { useMemo, useSyncExternalStore } from 'react'
import { distinctStyles, MIN_STYLES_TO_PLACE } from './discGame'
import { scoreDiagnostic, teamStartingBalance } from './diagnostic'
import { scoreDiscDiagnostic } from './discDiagnostic'
import { applyChoice, dilemmaForRound, SUMMIT } from './mandoIntegro'

// -----------------------------------------------------------------------------
// Capa de datos del demo. Todo vive en localStorage: no hay backend real.
//
//   companies: [{ id, name, email, password, createdAt }]
//   sessionAuth: companyId | null   (empresa "logueada")
//   sessions: [...]  -> la forma del estado depende del juego:
//
//   gameId 'codigo-disc'
//     teams: [{ id, name, participants: [{ id, name, role, style }] }]
//     currentDeckIndex: 0..6   (6 = fase de cierre)
//     rounds: [{ deckId, cardText, teamId, participantIds: [], placed, at }]
//     closingAnswers: [{ deckId, answer }]
//
//   gameId 'mando-integro'
//     participants: [{ id, name, role, diagnostic: {...} | null }]
//     balance: { cabeza, corazon, manos }   ·  position: 0..18
//     turnIndex, rounds: [{ deckId, dilemmaIndex, leaderId, choice, balanced, position, at }]
//     closingAnswers: { [deckId]: texto }
//     learningMatrix: { [participantId]: { [blockId]: texto } }
//     commitments: [{ participantId, dimension, text, reviewDate }]
// -----------------------------------------------------------------------------

const KEY = 'eureka.demo.v3'

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
  // Acciones - sesiones de "Código DISC"
  // ---------------------------------------------------------------------------

  createDiscSession({ name, purpose, teams }) {
    const session = {
      id: uid('se'),
      companyId: state.sessionAuth,
      gameId: 'codigo-disc',
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

  // ---------------------------------------------------------------------------
  // Acciones - sesiones de "Mando Íntegro"
  // ---------------------------------------------------------------------------

  createMandoSession({ name, purpose, participants }) {
    const session = {
      id: uid('se'),
      companyId: state.sessionAuth,
      gameId: 'mando-integro',
      name,
      purpose: purpose || '',
      createdAt: new Date().toISOString(),
      completedAt: null,
      status: 'draft',
      participants: participants.map((p) => ({
        id: uid('pa'),
        name: p.name.trim(),
        role: p.role.trim() || 'Líder',
        diagnostic: p.diagnostic || null
      })),
      balance: { cabeza: 4, corazon: 4, manos: 4 },
      position: 0,
      turnIndex: 0,
      rounds: [],
      closingAnswers: {},
      learningMatrix: {},
      commitments: []
    }
    setState((s) => ({ ...s, sessions: [...s.sessions, session] }))
    return session
  },

  // La encuesta previa la responde cada jugador desde su propio enlace. En
  // Código DISC además asigna su ficha de identidad; en Mando Íntegro define
  // dónde arranca su Balanza.
  saveDiagnostic(sessionId, participantId, answers) {
    const session = state.sessions.find((s) => s.id === sessionId)
    const isDisc = session?.gameId === 'codigo-disc'
    const result = isDisc ? scoreDiscDiagnostic(answers) : scoreDiagnostic(answers)
    const diagnostic = { ...result, answers, at: new Date().toISOString() }

    const applyTo = (p) =>
      p.id === participantId ? { ...p, diagnostic, ...(isDisc ? { style: result.dominant } : {}) } : p

    setState((s) => ({
      ...s,
      sessions: s.sessions.map((sess) => {
        if (sess.id !== sessionId) return sess
        if (sess.teams) {
          return { ...sess, teams: sess.teams.map((t) => ({ ...t, participants: t.participants.map(applyTo) })) }
        }
        return { ...sess, participants: sess.participants.map(applyTo) }
      })
    }))
    return result
  },

  // Al iniciar, la Balanza arranca en el promedio de los diagnósticos del grupo
  // en vez de 0-0-0, para que la partida refleje su patrón real de liderazgo.
  startMandoSession(sessionId) {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((sess) =>
        sess.id === sessionId
          ? {
              ...sess,
              status: 'in_progress',
              balance: teamStartingBalance(sess.participants),
              position: 0,
              turnIndex: 0,
              rounds: []
            }
          : sess
      )
    }))
  },

  recordMandoChoice(sessionId, choice) {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((sess) => {
        if (sess.id !== sessionId) return sess
        const roundIndex = sess.rounds.length
        const { deck, dilemmaIndex } = dilemmaForRound(roundIndex)
        const leader = sess.participants[sess.turnIndex % sess.participants.length]
        const next = applyChoice({ balance: sess.balance, position: sess.position }, choice)

        return {
          ...sess,
          balance: next.balance,
          position: next.position,
          turnIndex: sess.turnIndex + 1,
          rounds: [
            ...sess.rounds,
            {
              deckId: deck.id,
              dilemmaIndex,
              leaderId: leader?.id || null,
              leaderName: leader?.name || '',
              choice,
              balanced: next.balanced,
              steps: next.steps,
              position: next.position,
              at: new Date().toISOString()
            }
          ]
        }
      })
    }))
  },

  saveMandoClosing(sessionId, { closingAnswers, learningMatrix, commitments }) {
    this.updateSession(sessionId, {
      ...(closingAnswers ? { closingAnswers } : {}),
      ...(learningMatrix ? { learningMatrix } : {}),
      ...(commitments ? { commitments } : {})
    })
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
    gameId: 'codigo-disc',
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
    gameId: 'codigo-disc',
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

  return {
    company,
    sessions: [completedSession, draftSession, buildMandoDemoSession(companyId), buildMandoDraftSession(companyId)]
  }
}

// Sesión de "Mando Íntegro" todavía en borrador: sirve para mostrar el módulo
// de diagnóstico previo, con parte del grupo ya respondido y parte pendiente.
function buildMandoDraftSession(companyId) {
  const withDiagnostic = (ranked) => {
    const net = { cabeza: 0, corazon: 0, manos: 0 }
    ranked.forEach((id, i) => {
      net[id] = [6, 2, -4][i]
    })
    return {
      net,
      ranked,
      dominant: ranked[0],
      weakest: ranked[2],
      answeredRows: 18,
      at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
    }
  }

  return {
    id: 'se_demo_mando_draft',
    companyId,
    gameId: 'mando-integro',
    name: 'Jefes de área · Sesión de liderazgo',
    purpose: 'Conocer desde dónde lidera cada jefe antes de rediseñar los comités.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    completedAt: null,
    status: 'draft',
    participants: [
      {
        id: 'pa_d_1',
        name: 'Natalia Ocampo',
        role: 'Directora de Servicio',
        diagnostic: withDiagnostic(['corazon', 'cabeza', 'manos'])
      },
      {
        id: 'pa_d_2',
        name: 'Felipe Arango',
        role: 'Gerente de Planta',
        diagnostic: withDiagnostic(['manos', 'cabeza', 'corazon'])
      },
      // Estos dos todavía no responden: así se ve el estado pendiente y el
      // botón para copiarles el enlace del diagnóstico.
      { id: 'pa_d_3', name: 'Carolina Mesa', role: 'Líder de Tecnología', diagnostic: null },
      { id: 'pa_d_4', name: 'Sebastián Ruiz', role: 'Gerente Financiero', diagnostic: null }
    ],
    balance: { cabeza: 4, corazon: 4, manos: 4 },
    position: 0,
    turnIndex: 0,
    rounds: [],
    closingAnswers: {},
    learningMatrix: {},
    commitments: []
  }
}

// Sesión de "Mando Íntegro" ya jugada hasta la Cumbre, con diagnósticos
// aplicados y compromisos firmados, para poder mostrar el reporte completo.
function buildMandoDemoSession(companyId) {
  const people = [
    { id: 'pa_m1', name: 'Andrea Molina', role: 'Gerente de Operaciones', ranked: ['cabeza', 'manos', 'corazon'] },
    { id: 'pa_m2', name: 'Julián Restrepo', role: 'Líder Comercial', ranked: ['manos', 'cabeza', 'corazon'] },
    { id: 'pa_m3', name: 'Paola Guzmán', role: 'Jefe de Talento Humano', ranked: ['corazon', 'cabeza', 'manos'] },
    { id: 'pa_m4', name: 'Esteban Cárdenas', role: 'Coordinador de Proyectos', ranked: ['cabeza', 'corazon', 'manos'] }
  ]

  const participants = people.map((p) => {
    const net = { cabeza: 0, corazon: 0, manos: 0 }
    p.ranked.forEach((id, i) => {
      net[id] = [7, 1, -5][i]
    })
    return {
      id: p.id,
      name: p.name,
      role: p.role,
      diagnostic: {
        net,
        ranked: p.ranked,
        dominant: p.ranked[0],
        weakest: p.ranked[2],
        answeredRows: 18,
        at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString()
      }
    }
  })

  // Secuencia real de decisiones: arranca inclinada a Cabeza y el equipo
  // corrige hacia Corazón, terminando equilibrado en la Cumbre.
  const choices = [
    'cabeza', 'corazon', 'manos', 'corazon',
    'cabeza', 'manos', 'corazon', 'cabeza',
    'manos', 'corazon', 'cabeza', 'manos'
  ]

  let balance = { cabeza: 5, corazon: 4, manos: 4 }
  let position = 0
  const rounds = []
  const base = Date.now() - 1000 * 60 * 60 * 24 * 7

  choices.forEach((choice, i) => {
    if (position >= SUMMIT) return
    const { deck, dilemmaIndex } = dilemmaForRound(i)
    const leader = participants[i % participants.length]
    const next = applyChoice({ balance, position }, choice)
    balance = next.balance
    position = next.position
    rounds.push({
      deckId: deck.id,
      dilemmaIndex,
      leaderId: leader.id,
      leaderName: leader.name,
      choice,
      balanced: next.balanced,
      steps: next.steps,
      position,
      at: new Date(base + i * 1000 * 60 * 3).toISOString()
    })
  })

  return {
    id: 'se_demo_mando',
    companyId,
    gameId: 'mando-integro',
    name: 'Comité de líderes · Cumbre de liderazgo',
    purpose: 'Ver desde dónde lidera cada jefe de área cuando la decisión es suya.',
    createdAt: new Date(base).toISOString(),
    completedAt: new Date(base + 1000 * 60 * 58).toISOString(),
    status: 'completed',
    participants,
    balance,
    position,
    turnIndex: rounds.length,
    rounds,
    closingAnswers: {
      decisiones: 'En el dilema del proyecto con datos incompletos casi todos querían decidir solos.',
      feedback: 'Nos costó sostener honestidad y cuidado en la misma frase.',
      cambio: 'Cuando todo cambia rápido se nos olvida primero el Corazón.',
      conflicto: 'Nos costó más llegar a una acción concreta que entender los hechos.',
      hibrido: 'La distancia nos empujó a resolver por Manos, sin preguntar cómo estaban.',
      bienestar: 'Usamos poco la Cabeza para cuidar nuestro propio bienestar como líderes.'
    },
    learningMatrix: {
      pa_m1: {
        autoconocimiento: 'Bajo presión me voy directo a los datos y dejo de preguntar.',
        reconocimiento: 'Paola mostró que validar la emoción no frena la decisión.',
        aplicacion: 'El dilema de automatizar el proceso es literalmente lo que tengo esta semana.',
        compromiso: 'Preguntar antes de concluir en las reuniones de operación.'
      },
      pa_m3: {
        autoconocimiento: 'Evito el conflicto directo más de lo que creía.',
        reconocimiento: 'Julián cierra con acciones concretas y eso da calma al equipo.',
        aplicacion: 'La conversación de la promoción que vengo postergando.',
        compromiso: 'Tener esa conversación difícil antes del viernes.'
      }
    },
    commitments: [
      {
        participantId: 'pa_m1',
        dimension: 'corazon',
        text: 'Abrir cada comité preguntando cómo llega el equipo, antes de revisar indicadores.',
        reviewDate: new Date(base + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10)
      },
      {
        participantId: 'pa_m2',
        dimension: 'corazon',
        text: 'Hablar con Camilo sobre su carga antes de reasignarle el cliente nuevo.',
        reviewDate: new Date(base + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10)
      },
      {
        participantId: 'pa_m3',
        dimension: 'manos',
        text: 'Cerrar la conversación de promoción con un plan escrito y fecha.',
        reviewDate: new Date(base + 1000 * 60 * 60 * 24 * 4).toISOString().slice(0, 10)
      },
      {
        participantId: 'pa_m4',
        dimension: 'manos',
        text: 'Definir el primer paso del proyecto estancado y ejecutarlo en 48 horas.',
        reviewDate: new Date(base + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10)
      }
    ]
  }
}

export { uid }
