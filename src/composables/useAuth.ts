import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'
import { sanitizeInput } from '../utils/validation'
import type { LoginRequest } from '../types'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const isLoading = computed(() => authStore.isLoading)

  const login = async (credentials: LoginRequest) => {
    try {
      if (!credentials.username?.trim()) {
        toast.error('Usuario e obrigatorio')
        return false
      }

      if (!credentials.password) {
        toast.error('Senha e obrigatoria')
        return false
      }

      await authStore.login({
        username: sanitizeInput(credentials.username),
        password: credentials.password
      })

      toast.success('Login realizado com sucesso!')
      router.push('/home')
      return true
    } catch (error) {
      console.error('Erro no login:', error)
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
      toast.error('Voce precisa estar logado para acessar esta pagina')
      router.push('/')
      return false
    }

    return true
  }

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    requireAuth
  }
}
