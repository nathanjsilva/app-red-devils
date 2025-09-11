import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RankingService } from '../services/rankingService'
import { fakeAvatar } from '../utils/helpers'
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
      rankings.value = await RankingService.getRankings()
    } catch (err) {
      // Fallback para dados mockados se a API falhar
      console.warn('API não disponível, usando dados mockados')
      rankings.value = getMockRankings()
    } finally {
      isLoading.value = false
    }
  }

  const fetchGoalsRanking = async () => {
    try {
      return await RankingService.getGoalsRanking()
    } catch (err) {
      console.warn('API não disponível, usando dados mockados')
      return getMockRankings()[0]
    }
  }

  const fetchAssistsRanking = async () => {
    try {
      return await RankingService.getAssistsRanking()
    } catch (err) {
      console.warn('API não disponível, usando dados mockados')
      return getMockRankings()[1]
    }
  }

  const fetchGoalsPerGameRanking = async () => {
    try {
      return await RankingService.getGoalsPerGameRanking()
    } catch (err) {
      console.warn('API não disponível, usando dados mockados')
      return getMockRankings()[2]
    }
  }

  const fetchAssistsPerGameRanking = async () => {
    try {
      return await RankingService.getAssistsPerGameRanking()
    } catch (err) {
      console.warn('API não disponível, usando dados mockados')
      return getMockRankings()[3]
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Função para dados mockados (fallback)
  const getMockRankings = (): Ranking[] => [
    {
      title: 'Ranking de Gols',
      players: [
        { name: 'Carlos', points: 15, avatar: fakeAvatar(1) },
        { name: 'João', points: 12, avatar: fakeAvatar(2) },
        { name: 'Pedro', points: 9, avatar: fakeAvatar(3) },
        { name: 'Marcos', points: 7, avatar: fakeAvatar(4) },
        { name: 'Lucas', points: 5, avatar: fakeAvatar(5) },
        { name: 'André', points: 4, avatar: fakeAvatar(6) },
        { name: 'Felipe', points: 3, avatar: fakeAvatar(7) },
        { name: 'Tiago', points: 2, avatar: fakeAvatar(8) },
        { name: 'Rafael', points: 1, avatar: fakeAvatar(9) },
        { name: 'Bruno', points: 0, avatar: fakeAvatar(10) }
      ]
    },
    {
      title: 'Ranking de Assistências',
      players: [
        { name: 'Pedro', points: 11, avatar: fakeAvatar(11) },
        { name: 'Carlos', points: 10, avatar: fakeAvatar(12) },
        { name: 'João', points: 7, avatar: fakeAvatar(13) },
        { name: 'Marcos', points: 6, avatar: fakeAvatar(14) },
        { name: 'Lucas', points: 5, avatar: fakeAvatar(15) },
        { name: 'André', points: 4, avatar: fakeAvatar(16) },
        { name: 'Felipe', points: 3, avatar: fakeAvatar(17) },
        { name: 'Tiago', points: 2, avatar: fakeAvatar(18) },
        { name: 'Rafael', points: 1, avatar: fakeAvatar(19) },
        { name: 'Bruno', points: 0, avatar: fakeAvatar(20) }
      ]
    },
    {
      title: 'Média de Gols por Jogo',
      players: [
        { name: 'Carlos', points: 1.25, avatar: fakeAvatar(21) },
        { name: 'João', points: 1.0, avatar: fakeAvatar(22) },
        { name: 'Pedro', points: 0.9, avatar: fakeAvatar(23) },
        { name: 'Marcos', points: 0.8, avatar: fakeAvatar(24) },
        { name: 'Lucas', points: 0.7, avatar: fakeAvatar(25) },
        { name: 'André', points: 0.6, avatar: fakeAvatar(26) },
        { name: 'Felipe', points: 0.5, avatar: fakeAvatar(27) },
        { name: 'Tiago', points: 0.4, avatar: fakeAvatar(28) },
        { name: 'Rafael', points: 0.3, avatar: fakeAvatar(29) },
        { name: 'Bruno', points: 0.2, avatar: fakeAvatar(30) }
      ]
    },
    {
      title: 'Média de Assistências por Jogo',
      players: [
        { name: 'Pedro', points: 1.1, avatar: fakeAvatar(31) },
        { name: 'Carlos', points: 1.0, avatar: fakeAvatar(32) },
        { name: 'João', points: 0.6, avatar: fakeAvatar(33) },
        { name: 'Marcos', points: 0.5, avatar: fakeAvatar(34) },
        { name: 'Lucas', points: 0.4, avatar: fakeAvatar(35) },
        { name: 'André', points: 0.3, avatar: fakeAvatar(36) },
        { name: 'Felipe', points: 0.2, avatar: fakeAvatar(37) },
        { name: 'Tiago', points: 0.1, avatar: fakeAvatar(38) },
        { name: 'Rafael', points: 0.05, avatar: fakeAvatar(39) },
        { name: 'Bruno', points: 0.01, avatar: fakeAvatar(40) }
      ]
    }
  ]

  return {
    // State
    rankings,
    isLoading,
    error,
    
    // Actions
    fetchRankings,
    fetchGoalsRanking,
    fetchAssistsRanking,
    fetchGoalsPerGameRanking,
    fetchAssistsPerGameRanking,
    clearError
  }
})
