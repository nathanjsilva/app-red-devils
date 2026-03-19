import api from './api'
import type { LoginRequest, LoginResponse, User } from '../types'

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login', credentials)
    return (response as any).data?.data ?? response.data
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/admin/me')
    return (response as any).data?.data ?? response.data
  }

  static async logout(): Promise<void> {
    await api.post('/admin/logout')
  }
}
