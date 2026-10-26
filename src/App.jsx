import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from './lib/store'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Sessions from './pages/Sessions'
import GamesMarketplace from './pages/GamesMarketplace'
import GameDetail from './pages/GameDetail'
import SessionSetup from './pages/SessionSetup'
import SessionRoom from './pages/SessionRoom'
import Report from './pages/Report'
import Analytics from './pages/Analytics'
import People from './pages/People'
import Library from './pages/Library'
import Settings from './pages/Settings'
import Reinforcement from './pages/Reinforcement'
import Diagnostic from './pages/Diagnostic'

function RequireCompany({ children }) {
  const authed = useStore((s) => !!s.sessionAuth)
  return authed ? children : <Navigate to="/acceso" replace />
}

const protectedRoutes = [
  ['/app', <Dashboard />],
  ['/app/sesiones', <Sessions />],
  ['/app/juegos', <GamesMarketplace />],
  ['/app/juegos/:gameId', <GameDetail />],
  ['/app/juegos/:gameId/nueva', <SessionSetup />],
  ['/app/sesion/:id', <SessionRoom />],
  ['/app/sesion/:id/reporte', <Report />],
  ['/app/analitica', <Analytics />],
  ['/app/personas', <People />],
  ['/app/refuerzo', <Reinforcement />],
  ['/app/biblioteca', <Library />],
  ['/app/configuracion', <Settings />]
]

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/acceso" element={<Auth />} />
      {/* Público: cada líder responde su diagnóstico con su propio enlace */}
      <Route path="/diagnostico/:sessionId/:participantId" element={<Diagnostic />} />

      {protectedRoutes.map(([path, element]) => (
        <Route key={path} path={path} element={<RequireCompany>{element}</RequireCompany>} />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
