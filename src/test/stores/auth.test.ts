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
      access_token: 'token123',
      token_type: 'Bearer',
      player: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        position: 'linha'
      }
    }

    vi.mocked(AuthService.login).mockResolvedValue(mockResponse)

    const store = useAuthStore()
    const credentials = { email: 'test@example.com', password: 'password123' }

    await store.login(credentials)

    expect(store.token).toBe('Bearer token123')
    expect(store.user).toEqual(mockResponse.player)
    expect(store.isAuthenticated).toBe(true)
  })

  it('should logout successfully', async () => {
    const store = useAuthStore()
    store.user = { id: 1, name: 'Test', email: 'test@test.com', position: 'linha' }
    store.token = 'Bearer token123'

    await store.logout()

    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})
