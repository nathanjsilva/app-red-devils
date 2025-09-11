import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import { validateEmail, validatePassword, validateName, sanitizeInput } from '../utils/validation'
import type { LoginRequest, RegisterRequest } from '../types'

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

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    
    // Actions
    login,
    register,
    logout,
    requireAuth
  }
}
