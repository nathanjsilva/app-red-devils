import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import { AuthService } from '../../services/authService'

// Mock do AuthService
vi.mock('../../services/authService', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentPlayer: vi.fn(),
  }
}))

describe('Fluxo de Autenticação', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Não limpar localStorage aqui para permitir que os testes funcionem
  })

  describe('Fluxo de Login', () => {
    it('deve fazer login completo com sucesso', async () => {
      const mockLoginResponse = {
        data: {
          access_token: '1|abcdef123456789',
          token_type: 'Bearer',
          player: {
            id: 1,
            name: 'João Silva',
            email: 'joao@test.com',
            position: 'linha',
            phone: '11999999999',
            nickname: 'João Gol',
            created_at: '2024-01-01 12:00:00',
            updated_at: '2024-01-01 12:00:00'
          }
        }
      }

      vi.mocked(AuthService.login).mockResolvedValue(mockLoginResponse)

      const store = useAuthStore()
      const credentials = { email: 'joao@test.com', password: 'MinhaSenh@123' }

      // Executar login
      await store.login(credentials)

      // Verificar estado da store
      expect(store.isAuthenticated).toBe(true)
      expect(store.user).toEqual(mockLoginResponse.data.player)
      expect(store.token).toBe('Bearer 1|abcdef123456789')

      // Verificar localStorage
      expect(localStorage.getItem('token')).toBe('Bearer 1|abcdef123456789')
      expect(localStorage.getItem('player')).toBe(JSON.stringify(mockLoginResponse.data.player))

      // Verificar se AuthService foi chamado corretamente
      expect(AuthService.login).toHaveBeenCalledWith(credentials)
    })

    it('deve restaurar sessão do localStorage', () => {
      const mockPlayer = {
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com',
        position: 'linha',
        phone: '11999999999',
        nickname: 'João Gol',
        created_at: '2024-01-01 12:00:00',
        updated_at: '2024-01-01 12:00:00'
      }

      localStorage.setItem('token', 'Bearer 1|abcdef123456789')
      localStorage.setItem('player', JSON.stringify(mockPlayer))

      const store = useAuthStore()
      store.initializeAuth()

      expect(store.isAuthenticated).toBe(true)
      expect(store.user).toEqual(mockPlayer)
      expect(store.token).toBe('Bearer 1|abcdef123456789')
    })

    it('deve fazer logout completo', async () => {
      const store = useAuthStore()
      
      // Simular usuário logado
      store.user = {
        id: 1,
        name: 'João Silva',
        email: 'joao@test.com',
        position: 'linha',
        phone: '11999999999',
        nickname: 'João Gol',
        created_at: '2024-01-01 12:00:00',
        updated_at: '2024-01-01 12:00:00'
      }
      store.token = 'Bearer 1|abcdef123456789'
      localStorage.setItem('token', 'Bearer 1|abcdef123456789')
      localStorage.setItem('player', JSON.stringify(store.user))

      // Executar logout
      await store.logout()

      // Verificar estado da store
      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()

      // Verificar localStorage
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('player')).toBeNull()

      // Verificar se AuthService foi chamado
      expect(AuthService.logout).toHaveBeenCalled()
    })
  })

  describe('Fluxo de Registro', () => {
    it('deve registrar novo jogador com sucesso', async () => {
      const mockPlayerData = {
        name: 'Pedro Santos',
        email: 'pedro@test.com',
        password: 'MinhaSenh@123',
        position: 'goleiro' as const,
        phone: '11888888888',
        nickname: 'Pedro Goleiro'
      }

      const mockRegisteredPlayer = {
        id: 2,
        ...mockPlayerData,
        created_at: '2024-01-01 12:00:00',
        updated_at: '2024-01-01 12:00:00'
      }

      vi.mocked(AuthService.register).mockResolvedValue(mockRegisteredPlayer)

      const store = useAuthStore()

      // Executar registro
      await store.register(mockPlayerData)

      // Verificar se AuthService foi chamado corretamente
      expect(AuthService.register).toHaveBeenCalledWith(mockPlayerData)
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erro de login com credenciais inválidas', async () => {
      const mockError = new Error('Credenciais inválidas')
      vi.mocked(AuthService.login).mockRejectedValue(mockError)

      const store = useAuthStore()
      const credentials = { email: 'joao@test.com', password: 'senhaerrada' }

      // Executar login
      await expect(store.login(credentials)).rejects.toThrow('Credenciais inválidas')

      // Verificar que o estado não foi alterado
      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
    })

    it('deve tratar erro de registro com email duplicado', async () => {
      const mockError = new Error('Email já cadastrado')
      vi.mocked(AuthService.register).mockRejectedValue(mockError)

      const store = useAuthStore()
      const playerData = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: 'MinhaSenh@123',
        position: 'linha' as const,
        phone: '11999999999',
        nickname: 'João Gol'
      }

      // Executar registro
      await expect(store.register(playerData)).rejects.toThrow('Email já cadastrado')
    })
  })
})
