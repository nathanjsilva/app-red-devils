const defaultApiOrigin = window.location.port === '8080'
  ? `${window.location.protocol}//${window.location.hostname}:8081`
  : `${window.location.protocol}//${window.location.hostname}`

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${defaultApiOrigin}/api`

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
} as const

export const ROUTES = {
  LOGIN: '/login',
  HOME: '/home',
  PLAYERS_OVERVIEW: '/players-overview',
  STATISTICS: '/estatisticas',
  PELADAS: '/peladas',
  ADMIN_PLAYERS: '/admin/players',
  ADMIN_PELADAS: '/admin/peladas',
  ADMIN_MATCH_PLAYERS: '/admin/match-players',
  ADMIN_ORGANIZE_TEAMS: '/admin/organize-teams'
} as const

export const POSITIONS = {
  LINHA: 'linha',
  GOLEIRO: 'goleiro'
} as const

export const TOAST_CONFIG = {
  POSITION: 'top-right',
  TIMEOUT: 3000,
  CLOSE_ON_CLICK: true,
  PAUSE_ON_HOVER: true
} as const
