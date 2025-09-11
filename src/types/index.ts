// Tipos principais da aplicação

export interface Player {
  id: number
  name: string
  email: string
  position: 'linha' | 'goleiro'
  created_at?: string
  updated_at?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  player: Player
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  position: 'linha' | 'goleiro'
}

export interface UpdatePlayerRequest {
  name: string
  email: string
  old_password?: string
  new_password?: string
  position: 'linha' | 'goleiro'
}

export interface RankingPlayer {
  name: string
  points: number
  avatar: string
}

export interface Ranking {
  title: string
  players: RankingPlayer[]
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface MenuItem {
  name: string
  path: string
  icon: string
}
