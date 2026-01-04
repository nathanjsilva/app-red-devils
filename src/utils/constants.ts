// Constantes da aplicação

export const API_BASE_URL = 'http://168.75.95.247/api'

export const STORAGE_KEYS = {
  TOKEN: 'token',
  PLAYER: 'player'
} as const

export const ROUTES = {
  LOGIN: '/',
  REGISTER: '/register',
  HOME: '/home',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  SETUP_ADMIN: '/setup-admin'
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
