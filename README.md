# Eureka — Demo funcional

Prueba de concepto de una plataforma SaaS que **digitaliza juegos de mesa de dinámicas
de equipo** usados por empresas para team building y evaluación de RR.HH.

> Demo, no producción. No hay backend ni autenticación real: todo el estado vive en
> `localStorage` del navegador.

## Correr localmente

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Flujo completo del demo

1. **Landing** (`/`) — explica el producto. Botón **"Ver demo"** carga una empresa de
   ejemplo (*Nova Labs*) con una sesión ya jugada y su reporte.
2. **Acceso** (`/acceso`) — registro/login simulado de una empresa.
3. **Panel** (`/app`) — historial de sesiones y métricas.
4. **Nueva sesión** (`/app/nueva`) — nombre, objetivo y participantes (nombre + rol).
5. **Sala de sesión** (`/app/sesion/:id`) — se juega el turno de cada participante
   (en el mismo dispositivo, pasando la pantalla).
6. **La dinámica: "Pulso de Equipo"** (`/jugar/:id/:participantId`)
   - Ronda 1: auto-evaluación en 6 competencias (1–5), interfaz tipo cartas.
   - Ronda 2: a cada compañero se le da una carta de *fortaleza* y una de *a mejorar*.
7. **Reporte** (`/app/sesion/:id/reporte`) — índice de equipo, radar de competencias,
   gráfico de cartas repartidas, fortalezas/debilidades, brechas de percepción
   (puntos ciegos / fortalezas ocultas), lectura por persona y recomendaciones.

## Stack

- React 18 + Vite
- Tailwind CSS
- React Router
- Recharts (gráficos)
- `localStorage` como "backend"

## Estructura

```
src/
  lib/
    competencies.js   # definición de la dinámica
    store.js          # capa de datos sobre localStorage + datos de ejemplo
    report.js         # cálculo de insights del equipo
  components/          # AppShell, Logo, badges
  pages/              # Landing, Auth, Dashboard, SessionSetup, SessionRoom, Play, Report
```

## Reiniciar el demo

Desde el panel: *"Cargar datos de ejemplo"* reemplaza todo por la empresa demo.
Para borrar todo, limpia el `localStorage` del sitio en las devtools del navegador.
