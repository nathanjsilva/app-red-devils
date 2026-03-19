import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AuthService } from '../services/authService'
import { STORAGE_KEYS } from '../utils/constants'
import type { LoginRequest, User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (credentials: LoginRequest) => {
    isLoading.value = true
    try {
      const response = await AuthService.login(credentials)
      const accessToken = response.access_token
      const tokenType = response.token_type || 'Bearer'

      if (!accessToken) {
        throw new Error('Token invalido na resposta de login')
      }

      token.value = `${tokenType} ${accessToken}`
      user.value = response.user

      localStorage.setItem(STORAGE_KEYS.TOKEN, token.value)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))

      try {
        const current = await AuthService.getCurrentUser()
        user.value = current
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(current))
      } catch (error) {
        console.warn('Nao foi possivel atualizar o usuario atual.', error)
      }

      return response
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
  }

  const initializeAuth = async () => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER)

    if (!savedToken || !savedUser) {
      return
    }

    try {
      token.value = savedToken
      user.value = JSON.parse(savedUser)

      try {
        const current = await AuthService.getCurrentUser()
        user.value = current
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(current))
      } catch (error) {
        console.warn('Nao foi possivel validar a sessao atual.', error)
      }
    } catch (error) {
      console.error('Erro ao restaurar sessao:', error)
      await logout()
    }
  }

  const updateUser = (updatedUser: User) => {
    user.value = updatedUser
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    initializeAuth,
    updateUser
  }
})
