import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthService } from '../services/authService'
import { STORAGE_KEYS } from '../utils/constants'
import type { Player, LoginRequest, RegisterRequest } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<Player | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Actions
  const login = async (credentials: LoginRequest) => {
    isLoading.value = true
    try {
      const response = await AuthService.login(credentials)
      
      // Backend pode retornar em formatos diferentes, normalizamos aqui
      // Exemplos aceitos:
      // { access_token, token_type, player }
      // { token, token_type, user }
      // { token }
      const accessToken = (response as any).access_token || (response as any).token
      const tokenType = (response as any).token_type || 'Bearer'
      const playerResponse = (response as any).player || (response as any).user || null
      
      if (!accessToken) {
        console.error('Login response missing access token:', response)
        throw new Error('Token inválido na resposta de login')
      }
      
      token.value = `${tokenType} ${accessToken}`
      user.value = playerResponse
      
      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token.value)
      if (user.value) {
        localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(user.value))
      }

      // Após salvar o token, buscar o jogador atual para garantir campos como is_admin
      try {
        const current = await AuthService.getCurrentPlayer()
        user.value = current
        localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(current))
        console.log('Refreshed current player from /me:', current)
      } catch (e) {
        console.warn('Não foi possível atualizar o usuário atual (/me). Usando dados do login.', e)
      }
      
      // Debug: verificar se o token foi salvo corretamente
      console.log('Login successful - Token saved:', {
        tokenType,
        accessToken: accessToken ? String(accessToken).substring(0, 20) + '...' : 'N/A',
        fullToken: token.value,
        player: user.value
      })
      
      return response
    } finally {
      isLoading.value = false
    }
  }

  const register = async (playerData: RegisterRequest) => {
    isLoading.value = true
    try {
      const newPlayer = await AuthService.register(playerData)
      return newPlayer
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } finally {
      // Limpar estado local independente do resultado da API
      token.value = null
      user.value = null
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.PLAYER)
    }
  }

  const initializeAuth = async () => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const savedPlayer = localStorage.getItem(STORAGE_KEYS.PLAYER)
    
    console.log('initializeAuth called', { hasToken: !!savedToken, hasPlayer: !!savedPlayer })
    
    if (savedToken && savedPlayer) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedPlayer)
        console.log('Restored user from localStorage:', user.value)
        
        // Atualizar dados do usuário do backend para garantir campos como is_admin estão atualizados
        try {
          console.log('Calling /me to refresh user data...')
          const current = await AuthService.getCurrentPlayer()
          user.value = current
          localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(current))
          console.log('Refreshed current player from /me on init:', current)
        } catch (e) {
          console.warn('Não foi possível atualizar o usuário atual (/me) na inicialização. Usando dados do localStorage.', e)
        }
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error)
        logout()
      }
    } else {
      console.log('No saved token or player found')
    }
  }

  const updateUser = (updatedUser: Player) => {
    user.value = updatedUser
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(updatedUser))
  }

  const forgotPassword = async (email: string) => {
    isLoading.value = true
    try {
      await AuthService.forgotPassword(email)
      return true
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (token: string, password: string) => {
    isLoading.value = true
    try {
      await AuthService.resetPassword(token, password)
      return true
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const setupFirstAdmin = async (adminData: any) => {
    isLoading.value = true
    try {
      const response = await AuthService.setupFirstAdmin(adminData)
      return response
    } catch (error) {
      console.error('Erro ao criar primeiro admin:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    
    // Getters
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    initializeAuth,
    updateUser,
    forgotPassword,
    resetPassword,
    setupFirstAdmin
  }
})
