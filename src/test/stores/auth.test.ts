import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { AuthService } from '@/services/authService'

// Mock do AuthService
vi.mock('@/services/authService', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentPlayer: vi.fn(),
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with empty state', () => {
    const store = useAuthStore()
    
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isLoading).toBe(false)
  })

  it('should login successfully', async () => {
    const mockResponse = {
      data: {
        access_token: 'token123',
        token_type: 'Bearer',
        player: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          position: 'linha',
          phone: '11999999999',
          nickname: 'Test Player',
          created_at: '2024-01-01 12:00:00',
          updated_at: '2024-01-01 12:00:00'
        }
      }
    }

    vi.mocked(AuthService.login).mockResolvedValue(mockResponse)

    const store = useAuthStore()
    const credentials = { email: 'test@example.com', password: 'password123' }

    await store.login(credentials)

    expect(store.token).toBe('Bearer token123')
    expect(store.user).toEqual(mockResponse.data.player)
    expect(store.isAuthenticated).toBe(true)
  })

  it('should logout successfully', async () => {
    const store = useAuthStore()
    store.user = { 
      id: 1, 
      name: 'Test', 
      email: 'test@test.com', 
      position: 'linha',
      phone: '11999999999',
      nickname: 'Test Player',
      created_at: '2024-01-01 12:00:00',
      updated_at: '2024-01-01 12:00:00'
    }
    store.token = 'Bearer token123'

    await store.logout()

    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})
