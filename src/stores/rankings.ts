import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RankingService } from '../services/rankingService'
import type { Ranking } from '../types'

export const useRankingsStore = defineStore('rankings', () => {
  const rankings = ref<Ranking[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchRankings = async () => {
    isLoading.value = true
    error.value = null
    try {
      rankings.value = await RankingService.getAllRankings()
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

  const getTotalMatches = (): number => {
    let maxMatches = 0
    rankings.value.forEach((ranking) => {
      ranking.players.forEach((player) => {
        if (player.matches > maxMatches) {
          maxMatches = player.matches
        }
      })
    })
    return maxMatches
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
    clearError,
    getTotalMatches
  }
})
