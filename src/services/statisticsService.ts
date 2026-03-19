import api from './api'
import type {
  PeladaStatisticsResponse,
  PlayerPeladaStatisticsResponse,
  PlayersOverviewResponse,
  PlayerTotalStatisticsResponse,
  Ranking
} from '../types'

export class StatisticsService {
  static async getPlayersOverview(): Promise<PlayersOverviewResponse> {
    const response = await api.get<PlayersOverviewResponse>('/statistics/players/overview')
    return (response as any).data?.data ?? response.data
  }

  static async getPlayerTotalStatistics(playerId: number): Promise<PlayerTotalStatisticsResponse> {
    const response = await api.get<PlayerTotalStatisticsResponse>(`/statistics/player/${playerId}/total`)
    return (response as any).data?.data ?? response.data
  }

  static async getWinsRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/statistics/rankings/wins')
    return (response as any).data?.data ?? response.data
  }

  static async getGoalsRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/statistics/rankings/goals')
    return (response as any).data?.data ?? response.data
  }

  static async getAssistsRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/statistics/rankings/assists')
    return (response as any).data?.data ?? response.data
  }

  static async getGoalParticipationRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/statistics/rankings/goal-participation')
    return (response as any).data?.data ?? response.data
  }

  static async getGoalkeepersRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/statistics/rankings/goalkeepers')
    return (response as any).data?.data ?? response.data
  }

  static async getPeladaStatistics(peladaId: number): Promise<PeladaStatisticsResponse> {
    const response = await api.get<PeladaStatisticsResponse>(`/statistics/pelada/${peladaId}`)
    return (response as any).data?.data ?? response.data
  }

  static async getPlayerStatisticsForPelada(playerId: number, peladaId: number): Promise<PlayerPeladaStatisticsResponse> {
    const response = await api.get<PlayerPeladaStatisticsResponse>(`/statistics/player/${playerId}/pelada/${peladaId}`)
    return (response as any).data?.data ?? response.data
  }

  static async hasPeladaStatistics(peladaId: number): Promise<boolean> {
    try {
      const statistics = await this.getPeladaStatistics(peladaId)
      return (
        (statistics.statistics.field_players && statistics.statistics.field_players.length > 0) ||
        (statistics.statistics.goalkeepers && statistics.statistics.goalkeepers.length > 0)
      )
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return false
      }
      console.warn(`Erro ao verificar estatisticas da pelada ${peladaId}:`, error)
      return false
    }
  }
}
