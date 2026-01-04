import { defineStore } from 'pinia'
import { ref } from 'vue'
import { StatisticsService } from '../services/statisticsService'
import type { PlayerStatistics } from '../types'

export const useStatisticsStore = defineStore('statistics', () => {
  // State
  const playerStatistics = ref<PlayerStatistics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchPlayerStatistics = async (playerId: number) => {
    isLoading.value = true
    error.value = null
    try {
      playerStatistics.value = await StatisticsService.getPlayerTotalStatistics(playerId)
      return playerStatistics.value
    } catch (err) {
      error.value = 'Erro ao carregar estatísticas do jogador'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    playerStatistics,
    isLoading,
    error,
    
    // Actions
    fetchPlayerStatistics,
    clearError
  }
})

