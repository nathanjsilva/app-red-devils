import api from './api'
import type { LoginRequest, LoginResponse, RegisterRequest, Player } from '../types'

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login', credentials)
    return response.data
  }

  static async register(playerData: RegisterRequest): Promise<Player> {
    const response = await api.post<Player>('/players', playerData)
    return response.data
  }

  static async getCurrentPlayer(): Promise<Player> {
    const response = await api.get<Player>('/me')
    return response.data
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/logout')
    } catch (error) {
      // Ignora erros de logout (token pode já estar expirado)
      console.warn('Erro ao fazer logout:', error)
    }
  }
}
