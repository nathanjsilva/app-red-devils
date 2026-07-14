import api from './api'
import type {
  ComparePlayerEntry,
  DashboardOverview,
  EvolutionPoint,
  PeladaStatisticsResponse,
  PlayerPeladaStatisticsResponse,
  PlayersOverviewResponse,
  PlayerTotalStatisticsResponse,
  StatisticsFilters
} from '../types'

export class StatisticsService {
  static async getDashboard(filters: StatisticsFilters = {}): Promise<DashboardOverview> {
    const response = await api.get('/statistics/dashboard', { params: filters })
    return response.data.data
  }

  static async getEvolution(groupBy: 'match' | 'month' | 'year' = 'month', filters: StatisticsFilters = {}, limit?: number): Promise<EvolutionPoint[]> {
    const response = await api.get('/statistics/evolution', { params: { group_by: groupBy, limit, ...filters } })
    return response.data.data
  }

  static async comparePlayers(playerIds: number[], filters: StatisticsFilters = {}): Promise<ComparePlayerEntry[]> {
    const response = await api.get('/statistics/players/compare', {
      params: { player_ids: playerIds, ...filters }
    })
    return response.data.data
  }

  static async getPlayersOverview(): Promise<PlayersOverviewResponse> {
    const response = await api.get<PlayersOverviewResponse>('/statistics/players/overview')
    return (response as any).data?.data ?? response.data
  }

  static async getPlayerTotalStatistics(playerId: number): Promise<PlayerTotalStatisticsResponse> {
    const response = await api.get<PlayerTotalStatisticsResponse>(`/statistics/player/${playerId}/total`)
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
