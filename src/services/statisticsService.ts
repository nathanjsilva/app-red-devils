import api from './api'
import type { PlayerStatistics, Ranking, PeladaStatisticsResponse } from '../types'

export class StatisticsService {
  static async getPlayerTotalStatistics(playerId: number): Promise<PlayerStatistics> {
    const response = await api.get<PlayerStatistics>(`/statistics/player/${playerId}/total`)
    return response.data
  }

  static async getWinsRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/statistics/rankings/wins')
    return response.data
  }

  static async getGoalsRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/statistics/rankings/goals')
    return response.data
  }

  static async getAssistsRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/statistics/rankings/assists')
    return response.data
  }

  static async getGoalParticipationRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/statistics/rankings/goal-participation')
    return response.data
  }

  static async getGoalkeepersRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/statistics/rankings/goalkeepers')
    return response.data
  }

  static async getPeladaStatistics(peladaId: number): Promise<PeladaStatisticsResponse> {
    const response = await api.get(`/statistics/pelada/${peladaId}`)
    console.log('Pelada Statistics API raw response:', response.data)
    // API pode retornar { data: PeladaStatisticsResponse } ou PeladaStatisticsResponse diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as PeladaStatisticsResponse
  }

  static async getPlayerStatisticsForPelada(playerId: number, peladaId: number): Promise<PlayerStatistics> {
    const response = await api.get<PlayerStatistics>(`/statistics/player/${playerId}/pelada/${peladaId}`)
    return response.data
  }

  /**
   * Verifica se uma pelada tem estatísticas cadastradas
   * Retorna true se a pelada tiver estatísticas, false caso contrário
   */
  static async hasPeladaStatistics(peladaId: number): Promise<boolean> {
    try {
      const statistics = await this.getPeladaStatistics(peladaId)
      // Verifica se há estatísticas de jogadores de linha ou goleiros
      return (
        (statistics.statistics.field_players && statistics.statistics.field_players.length > 0) ||
        (statistics.statistics.goalkeepers && statistics.statistics.goalkeepers.length > 0)
      )
    } catch (error: any) {
      // Se retornar 404 ou erro, significa que não há estatísticas
      if (error?.response?.status === 404) {
        return false
      }
      // Para outros erros, retorna false também para não quebrar a UI
      console.warn(`Erro ao verificar estatísticas da pelada ${peladaId}:`, error)
      return false
    }
  }
}

