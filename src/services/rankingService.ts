import api from './api'
import type { Ranking, RankingPlayer, StatisticsFilters } from '../types'

const RANKING_LABELS: Record<string, string> = {
  wins: 'Vitórias',
  goals: 'Gols',
  assists: 'Assistências',
  'goal-participations': 'Participações em Gols',
  goalkeepers: 'Goleiros (Gols Sofridos)',
  'win-rate': 'Aproveitamento',
  appearances: 'Presenças',
  'top-scorer-frequency': 'Artilheiro da pelada',
  'top-assister-frequency': 'Garçom da pelada'
}

export class RankingService {
  private static mapItem(item: any): RankingPlayer {
    return {
      id: item.player?.id ?? 0,
      name: item.player?.name ?? '—',
      nickname: item.player?.nickname ?? '',
      position: item.player?.position ?? 'linha',
      total: item.value ?? 0,
      matches: item.matches ?? 0,
      average: item.average_per_match ?? 0
    }
  }

  static async getFullRanking(type: keyof typeof RANKING_LABELS, perPage = 10, filters: StatisticsFilters = {}): Promise<Ranking> {
    const response = await api.get(`/statistics/rankings/${type}`, { params: { per_page: perPage, ...filters } })
    const body = response.data as { data: any[]; meta?: { ranking_type?: string } }
    return {
      type: body.meta?.ranking_type ?? RANKING_LABELS[type],
      players: (body.data ?? []).map(this.mapItem)
    }
  }

  static getWinsRanking = (filters: StatisticsFilters = {}, perPage = 10) => this.getFullRanking('wins', perPage, filters)
  static getGoalsRanking = (filters: StatisticsFilters = {}, perPage = 10) => this.getFullRanking('goals', perPage, filters)
  static getAssistsRanking = (filters: StatisticsFilters = {}, perPage = 10) => this.getFullRanking('assists', perPage, filters)
  static getGoalParticipationRanking = (filters: StatisticsFilters = {}, perPage = 10) => this.getFullRanking('goal-participations', perPage, filters)
  static getGoalkeepersRanking = (filters: StatisticsFilters = {}, perPage = 10) => this.getFullRanking('goalkeepers', perPage, filters)

  static async getAllRankings(filters: StatisticsFilters = {}, perPage = 10): Promise<Ranking[]> {
    const rankingEndpoints = [
      () => this.getWinsRanking(filters, perPage),
      () => this.getGoalsRanking(filters, perPage),
      () => this.getAssistsRanking(filters, perPage),
      () => this.getGoalParticipationRanking(filters, perPage),
      () => this.getGoalkeepersRanking(filters, perPage)
    ]

    const results = await Promise.allSettled(rankingEndpoints.map((fn) => fn()))
    return results
      .filter((result): result is PromiseFulfilledResult<Ranking> => result.status === 'fulfilled')
      .map((result) => result.value)
  }
}
