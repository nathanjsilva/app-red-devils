import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RankingService } from '../services/rankingService'
import type { Ranking } from '../types'

export const useRankingsStore = defineStore('rankings', () => {
  // State
  const rankings = ref<Ranking[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchRankings = async () => {
    isLoading.value = true
    error.value = null
    try {
      const result = await RankingService.getAllRankings()
      rankings.value = result
    } catch (err) {
      console.warn('❌ Erro ao buscar rankings:', err)
      error.value = 'Erro ao carregar rankings'
    } finally {
      isLoading.value = false
    }
  }

  const fetchGoalsRanking = async () => {
    try {
      return await RankingService.getGoalsRanking()
    } catch (err) {
      console.warn('Erro ao buscar ranking de gols:', err)
      throw err
    }
  }

  const fetchAssistsRanking = async () => {
    try {
      return await RankingService.getAssistsRanking()
    } catch (err) {
      console.warn('Erro ao buscar ranking de assistências:', err)
      throw err
    }
  }

  const fetchWinsRanking = async () => {
    try {
      return await RankingService.getWinsRanking()
    } catch (err) {
      console.warn('Erro ao buscar ranking de vitórias:', err)
      throw err
    }
  }

  const fetchGoalkeepersRanking = async () => {
    try {
      return await RankingService.getGoalkeepersRanking()
    } catch (err) {
      console.warn('Erro ao buscar ranking de goleiros:', err)
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Calcular total de jogos baseado no maior total_matches dos rankings
  const getTotalMatches = (): number => {
    if (!rankings.value || rankings.value.length === 0) {
      return 0
    }
    
    let maxMatches = 0
    for (const ranking of rankings.value) {
      if (ranking.players && ranking.players.length > 0) {
        for (const player of ranking.players) {
          if (player.matches > maxMatches) {
            maxMatches = player.matches
          }
        }
      }
    }
    
    return maxMatches
  }

  return {
    // State
    rankings,
    isLoading,
    error,
    
    // Actions
    fetchRankings,
    fetchGoalsRanking,
    fetchAssistsRanking,
    fetchWinsRanking,
    fetchGoalkeepersRanking,
    clearError,
    getTotalMatches
  }
})
