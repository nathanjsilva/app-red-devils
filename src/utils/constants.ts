export const API_BASE_URL = 'http://localhost/api'

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
} as const

export const ROUTES = {
  LOGIN: '/login',
  HOME: '/home',
  PLAYERS_OVERVIEW: '/players-overview',
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
