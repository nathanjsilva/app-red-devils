import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import { validateEmail, validatePassword, validateName, sanitizeInput } from '../utils/validation'
import { cleanPhone } from '../utils/phoneMask'
import type { LoginRequest, RegisterRequest, SetupFirstAdminRequest } from '../types'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  // Getters computados
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const isLoading = computed(() => authStore.isLoading)

  // Funções de autenticação
  const login = async (credentials: LoginRequest) => {
    try {
      // Validação
      if (!validateEmail(credentials.email)) {
        toast.error('E-mail inválido')
        return false
      }

      if (!credentials.password) {
        toast.error('Senha é obrigatória')
        return false
      }

      // Sanitizar inputs
      const sanitizedCredentials = {
        email: sanitizeInput(credentials.email),
        password: credentials.password
      }

      await authStore.login(sanitizedCredentials)
      toast.success('Login realizado com sucesso!')
      router.push('/home')
      return true
    } catch (error) {
      console.error('Erro no login:', error)
      return false
    }
  }

  const register = async (playerData: RegisterRequest) => {
    try {
      // Validações
      const nameValidation = validateName(playerData.name)
      if (!nameValidation.isValid) {
        toast.error(nameValidation.message!)
        return false
      }

      if (!validateEmail(playerData.email)) {
        toast.error('E-mail inválido')
        return false
      }

      const passwordValidation = validatePassword(playerData.password)
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message!)
        return false
      }

      // Sanitizar inputs
      const sanitizedData = {
        name: sanitizeInput(playerData.name),
        email: sanitizeInput(playerData.email),
        password: playerData.password,
        phone: cleanPhone(sanitizeInput(playerData.phone)), // Remove formatação do telefone
        nickname: sanitizeInput(playerData.nickname),
        position: playerData.position
      }

      await authStore.register(sanitizedData)
      toast.success('Conta criada com sucesso!')
      router.push('/')
      return true
    } catch (error) {
      console.error('Erro no registro:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await authStore.logout()
      toast.success('Logout realizado com sucesso!')
      router.push('/')
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const requireAuth = () => {
    if (!isAuthenticated.value) {
      toast.error('Você precisa estar logado para acessar esta página')
      router.push('/')
      return false
    }
    return true
  }

  const forgotPassword = async (email: string) => {
    try {
      if (!validateEmail(email)) {
        toast.error('E-mail inválido')
        return false
      }

      const sanitizedEmail = sanitizeInput(email)
      await authStore.forgotPassword(sanitizedEmail)
      toast.success('Instruções de recuperação enviadas para seu e-mail!')
      return true
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error)
      toast.error('Erro ao enviar instruções de recuperação. Tente novamente.')
      return false
    }
  }

  const resetPassword = async (token: string, password: string) => {
    try {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message!)
        return false
      }

      await authStore.resetPassword(token, password)
      toast.success('Senha redefinida com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      toast.error('Erro ao redefinir senha. Tente novamente.')
      return false
    }
  }

  const setupFirstAdmin = async (adminData: SetupFirstAdminRequest) => {
    try {
      // Validações
      const nameValidation = validateName(adminData.name)
      if (!nameValidation.isValid) {
        toast.error(nameValidation.message!)
        return false
      }

      if (!validateEmail(adminData.email)) {
        toast.error('E-mail inválido')
        return false
      }

      const passwordValidation = validatePassword(adminData.password)
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message!)
        return false
      }

      // Sanitizar inputs
      const sanitizedData = {
        name: sanitizeInput(adminData.name),
        email: sanitizeInput(adminData.email),
        password: adminData.password,
        phone: cleanPhone(sanitizeInput(adminData.phone)),
        nickname: sanitizeInput(adminData.nickname),
        position: adminData.position
      }

      await authStore.setupFirstAdmin(sanitizedData)
      toast.success('Primeiro administrador criado com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao criar primeiro admin:', error)
      toast.error('Erro ao criar primeiro administrador. Tente novamente.')
      return false
    }
  }

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    
    // Actions
    login,
    register,
    logout,
    requireAuth,
    forgotPassword,
    resetPassword,
    setupFirstAdmin
  }
}
