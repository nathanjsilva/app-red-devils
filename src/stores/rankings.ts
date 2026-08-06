import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RankingService } from '../services/rankingService'
import type { Ranking, StatisticsFilters } from '../types'

export const useRankingsStore = defineStore('rankings', () => {
  const rankings = ref<Ranking[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchRankings = async (filters: StatisticsFilters = {}) => {
    isLoading.value = true
    error.value = null
    try {
      rankings.value = await RankingService.getAllRankings(filters)
    } catch (err) {
      console.warn('Erro ao buscar rankings:', err)
      error.value = 'Erro ao carregar rankings'
    } finally {
      isLoading.value = false
    }
  }

  const fetchGoalsRanking = async () => RankingService.getGoalsRanking()
  const fetchAssistsRanking = async () => RankingService.getAssistsRanking()
  const fetchWinsRanking = async () => RankingService.getWinsRanking()
  const fetchGoalkeepersRanking = async () => RankingService.getGoalkeepersRanking()

  const clearError = () => {
    error.value = null
  }

  return {
    rankings,
    isLoading,
    error,
    fetchRankings,
    fetchGoalsRanking,
    fetchAssistsRanking,
    fetchWinsRanking,
    fetchGoalkeepersRanking,
    clearError
  }
})
