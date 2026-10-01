// Set minimal de iconos de linea (estilo Lucide/Feather) para no depender de
// una libreria externa. Todos toman `className` y heredan currentColor.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

const Svg = ({ className = 'h-5 w-5', children }) => (
  <svg {...base} className={className}>
    {children}
  </svg>
)

export const IconHome = (p) => (
  <Svg {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9v10a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9" />
  </Svg>
)

export const IconGrid = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Svg>
)

export const IconUsers = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle cx="17" cy="8.5" r="2.6" />
    <path d="M15.5 14.2c2.6.4 4.5 2.7 4.5 5.8" />
  </Svg>
)

export const IconChart = (p) => (
  <Svg {...p}>
    <path d="M4 20V10" />
    <path d="M11 20V4" />
    <path d="M18 20v-7" />
    <path d="M3 20h18" />
  </Svg>
)

export const IconSettings = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.4-2.3.9a7.7 7.7 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.7 7.7 0 0 0-1.7 1l-2.3-.9-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9c.5.4 1.1.75 1.7 1L11 20.5h4l.4-2.5c.6-.25 1.2-.6 1.7-1l2.3.9 2-3.4-2-1.5Z" />
  </Svg>
)

export const IconLogout = (p) => (
  <Svg {...p}>
    <path d="M15 17.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1.5" />
    <path d="M9.5 12H21" />
    <path d="M17.5 8.5 21 12l-3.5 3.5" />
  </Svg>
)

export const IconMenu = (p) => (
  <Svg {...p}>
    <path d="M4 6.5h16" />
    <path d="M4 12h16" />
    <path d="M4 17.5h16" />
  </Svg>
)

export const IconClose = (p) => (
  <Svg {...p}>
    <path d="M5 5l14 14" />
    <path d="M19 5 5 19" />
  </Svg>
)

export const IconChevronRight = ({ className = 'h-3.5 w-3.5' }) => (
  <Svg className={className}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
)

export const IconChevronDown = ({ className = 'h-4 w-4' }) => (
  <Svg className={className}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
)

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Svg>
)

export const IconLayers = (p) => (
  <Svg {...p}>
    <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
    <path d="m4 12 8 4.3 8-4.3" />
    <path d="m4 16.5 8 4.3 8-4.3" />
  </Svg>
)

export const IconCards = (p) => (
  <Svg {...p}>
    <rect x="3" y="6.5" width="11" height="14" rx="2" />
    <path d="M8 4.2 17.6 3a2 2 0 0 1 2.2 1.7l1.2 10a2 2 0 0 1-1.4 2.2L17 17.6" />
  </Svg>
)

export const IconSparkles = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 13.6 8 18 9.5 13.6 11 12 15.5 10.4 11 6 9.5 10.4 8 12 3.5Z" />
    <path d="M18.5 15.5 19.3 18l2.2.8-2.2.8-.8 2.4-.8-2.4-2.2-.8 2.2-.8.8-2.5Z" />
  </Svg>
)

export const IconPlus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
)

export const IconPlay = (p) => (
  <Svg {...p}>
    <path d="M7.5 5.2v13.6a.8.8 0 0 0 1.22.68l11-6.8a.8.8 0 0 0 0-1.36l-11-6.8a.8.8 0 0 0-1.22.68Z" />
  </Svg>
)

export const IconTrophy = (p) => (
  <Svg {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 5.5H4.5v1A3.5 3.5 0 0 0 7.6 10" />
    <path d="M17 5.5h2.5v1A3.5 3.5 0 0 1 16.4 10" />
    <path d="M12 14v3.5" />
    <path d="M8.5 20.5h7" />
    <path d="M10 17.5h4v3h-4z" />
  </Svg>
)

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Svg>
)

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
)

export const IconArrowRight = (p) => (
  <Svg {...p}>
    <path d="M4.5 12h15" />
    <path d="m13.5 6 6 6-6 6" />
  </Svg>
)

export const IconTarget = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" />
  </Svg>
)

export const IconFilter = (p) => (
  <Svg {...p}>
    <path d="M4 6h16" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </Svg>
)
