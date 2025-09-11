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
      
      token.value = `${response.token_type} ${response.access_token}`
      user.value = response.player
      
      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, token.value)
      localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(user.value))
      
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

  const initializeAuth = () => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const savedPlayer = localStorage.getItem(STORAGE_KEYS.PLAYER)
    
    if (savedToken && savedPlayer) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedPlayer)
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error)
        logout()
      }
    }
  }

  const updateUser = (updatedUser: Player) => {
    user.value = updatedUser
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(updatedUser))
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
    updateUser
  }
})
