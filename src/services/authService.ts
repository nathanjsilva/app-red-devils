import api from './api'
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  Player, 
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SetupFirstAdminRequest 
} from '../types'

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login', credentials)
    // Log para inspecionar o formato real retornado pelo backend
    console.log('Login API raw response:', response.data)
    // Alguns backends retornam dados embrulhados em { data: {...} }
    const payload: any = (response as any).data && (response as any).data.data
      ? (response as any).data.data
      : (response as any).data
    return payload
  }

  static async register(playerData: RegisterRequest): Promise<Player> {
    const response = await api.post<Player>('/players', playerData)
    // API pode retornar { data: Player } ou Player diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Player
  }

  static async getCurrentPlayer(): Promise<Player> {
    const response = await api.get<Player>('/me')
    // API pode retornar { data: Player } ou Player diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Player
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/logout')
    } catch (error) {
      // Ignora erros de logout (token pode já estar expirado)
      console.warn('Erro ao fazer logout:', error)
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    const requestData: ForgotPasswordRequest = { email }
    const response = await api.post('/forgot-password', requestData)
    return response.data
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    const requestData: ResetPasswordRequest = { 
      token, 
      password,
      password_confirmation: password
    }
    const response = await api.post('/reset-password', requestData)
    return response.data
  }

  static async setupFirstAdmin(adminData: SetupFirstAdminRequest): Promise<{ message: string; player: Player }> {
    const response = await api.post('/setup-first-admin', adminData)
    // API pode retornar { data: {...} } ou diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload
  }
}
