import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '../../composables/useAuth'
import { useForm } from '../../composables/useForm'
import { useResponsive } from '../../composables/useResponsive'
import { useLocalStorage } from '../../composables/useLocalStorage'
import { AuthService } from '../../services/authService'

// Mock do vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock do vue-toastification
vi.mock('vue-toastification', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  })
}))

// Mock do AuthService
vi.mock('../../services/authService', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentPlayer: vi.fn(),
  }
}))

// Mock do window
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
})

describe('Fluxo de Composables', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('useAuth Composable', () => {
    it('deve executar fluxo completo de autenticação', async () => {
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

      const { login, isAuthenticated, user, isLoading } = useAuth()

      // Verificar estado inicial
      expect(isAuthenticated.value).toBe(false)
      expect(user.value).toBeNull()
      expect(isLoading.value).toBe(false)

      // Executar login
      const result = await login({
        email: 'joao@test.com',
        password: 'MinhaSenh@123'
      })

      // Verificar resultado
      expect(result).toBe(true)
      expect(isAuthenticated.value).toBe(true)
      expect(user.value).toEqual(mockLoginResponse.data.player)
    })

    it('deve tratar erro de login', async () => {
      vi.mocked(AuthService.login).mockRejectedValue(new Error('Credenciais inválidas'))

      const { login, isAuthenticated } = useAuth()

      // Executar login com erro
      const result = await login({
        email: 'joao@test.com',
        password: 'senhaerrada'
      })

      // Verificar que login falhou
      expect(result).toBe(false)
      expect(isAuthenticated.value).toBe(false)
    })

    it('deve executar fluxo de registro', async () => {
      const mockPlayerData = {
        name: 'Pedro Santos',
        email: 'pedro@test.com',
        password: 'MinhaSenh@123',
        position: 'goleiro' as const,
        phone: '11888888888',
        nickname: 'Pedro Goleiro'
      }

      vi.mocked(AuthService.register).mockResolvedValue({
        id: 2,
        ...mockPlayerData,
        created_at: '2024-01-01 12:00:00',
        updated_at: '2024-01-01 12:00:00'
      })

      const { register } = useAuth()

      // Executar registro
      const result = await register(mockPlayerData)

      // Verificar resultado
      expect(result).toBe(true)
      expect(AuthService.register).toHaveBeenCalledWith(mockPlayerData)
    })
  })

  describe('useForm Composable', () => {
    it('deve executar fluxo completo de formulário', async () => {
      const initialValues = {
        name: '',
        email: '',
        password: ''
      }

      const { form, errors, validate, executeWithLoading, isLoading } = useForm(initialValues)

      // Verificar estado inicial
      expect(form).toEqual(initialValues)
      expect(errors).toEqual({})
      expect(isLoading.value).toBe(false)

      // Preencher formulário
      form.name = 'João Silva'
      form.email = 'joao@test.com'
      form.password = 'MinhaSenh@123'

      // Validar formulário
      const isValid = validate([
        () => form.name ? true : (errors.name = 'Nome é obrigatório', false),
        () => form.email ? true : (errors.email = 'E-mail é obrigatório', false),
        () => form.password ? true : (errors.password = 'Senha é obrigatória', false)
      ])

      // Verificar validação
      expect(isValid).toBe(true)
      expect(errors).toEqual({})

      // Executar ação com loading
      let actionExecuted = false
      await executeWithLoading(async () => {
        actionExecuted = true
        // Simular operação assíncrona
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Verificar execução
      expect(actionExecuted).toBe(true)
      expect(isLoading.value).toBe(false)
    })

    it('deve tratar validação com erros', () => {
      const { form, errors, validate } = useForm({
        name: '',
        email: '',
        password: ''
      })

      // Tentar validar formulário vazio
      const isValid = validate([
        () => form.name ? true : (errors.name = 'Nome é obrigatório', false),
        () => form.email ? true : (errors.email = 'E-mail é obrigatório', false),
        () => form.password ? true : (errors.password = 'Senha é obrigatória', false)
      ])

      // Verificar que validação falhou
      expect(isValid).toBe(false)
      expect(errors.name).toBe('Nome é obrigatório')
      expect(errors.email).toBe('E-mail é obrigatório')
      expect(errors.password).toBe('Senha é obrigatória')
    })
  })

  describe('useResponsive Composable', () => {
    it('deve detectar tamanho de tela corretamente', () => {
      // Mock do window.innerWidth e innerHeight
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true
      })
      Object.defineProperty(window, 'innerHeight', {
        value: 768,
        writable: true
      })

      const { windowWidth, windowHeight, isMobile, isTablet, isDesktop } = useResponsive()

      // Verificar valores iniciais
      expect(windowWidth.value).toBe(1024)
      expect(windowHeight.value).toBe(768)
      expect(isMobile.value).toBe(false)
      expect(isTablet.value).toBe(false)
      expect(isDesktop.value).toBe(true)
    })

    it('deve reagir a mudanças de tamanho de tela', () => {
      // Mock inicial
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true
      })

      const { isMobile, isTablet, isDesktop } = useResponsive()

      // Simular tela mobile
      Object.defineProperty(window, 'innerWidth', {
        value: 600,
        writable: true
      })

      // Disparar evento de resize
      window.dispatchEvent(new Event('resize'))

      // Verificar que detectou mobile
      expect(isMobile.value).toBe(true)
      expect(isTablet.value).toBe(false)
      expect(isDesktop.value).toBe(false)
    })
  })

  describe('useLocalStorage Composable', () => {
    it('deve executar fluxo completo de localStorage', () => {
      const { value, setValue, removeValue } = useLocalStorage('test-key', 'default-value')

      // Verificar valor inicial
      expect(value.value).toBe('default-value')

      // Alterar valor
      setValue('new-value')
      expect(value.value).toBe('new-value')
      expect(localStorage.getItem('test-key')).toBe('"new-value"')

      // Remover valor
      removeValue()
      expect(value.value).toBe('default-value')
      expect(localStorage.getItem('test-key')).toBeNull()
    })

    it('deve restaurar valor do localStorage', () => {
      // Simular valor existente no localStorage
      localStorage.setItem('existing-key', '{"name": "João", "age": 30}')

      const { value } = useLocalStorage('existing-key', {})

      // Verificar que valor foi restaurado
      expect(value.value).toEqual({ name: 'João', age: 30 })
    })
  })

  describe('Integração entre Composables', () => {
    it('deve integrar useAuth com useForm para login', async () => {
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

      const { login } = useAuth()
      const { form, errors, validate, executeWithLoading } = useForm({
        email: '',
        password: ''
      })

      // Preencher formulário
      form.email = 'joao@test.com'
      form.password = 'MinhaSenh@123'

      // Validar e executar login
      const isValid = validate([
        () => form.email ? true : (errors.email = 'E-mail é obrigatório', false),
        () => form.password ? true : (errors.password = 'Senha é obrigatória', false)
      ])

      expect(isValid).toBe(true)

      let loginResult = false
      await executeWithLoading(async () => {
        loginResult = await login({
          email: form.email,
          password: form.password
        })
      })

      // Verificar resultado
      expect(loginResult).toBe(true)
      expect(AuthService.login).toHaveBeenCalledWith({
        email: 'joao@test.com',
        password: 'MinhaSenh@123'
      })
    })
  })
})
