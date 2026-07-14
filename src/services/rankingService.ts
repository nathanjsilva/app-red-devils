import api from './api'
import type { Ranking, RankingPlayer, StatisticsFilters } from '../types'

const RANKING_LABELS: Record<string, string> = {
  wins: 'Vitórias',
  goals: 'Gols',
  assists: 'Assistências',
  'goal-participations': 'Participação em Gols',
  goalkeepers: 'Goleiros (Gols Sofridos)',
  'win-rate': 'Aproveitamento',
  appearances: 'Presenças'
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

  static getWinsRanking = () => this.getFullRanking('wins')
  static getGoalsRanking = () => this.getFullRanking('goals')
  static getAssistsRanking = () => this.getFullRanking('assists')
  static getGoalParticipationRanking = () => this.getFullRanking('goal-participations')
  static getGoalkeepersRanking = () => this.getFullRanking('goalkeepers')

  static async getAllRankings(): Promise<Ranking[]> {
    const rankingEndpoints = [
      this.getWinsRanking.bind(this),
      this.getGoalsRanking.bind(this),
      this.getAssistsRanking.bind(this),
      this.getGoalParticipationRanking.bind(this),
      this.getGoalkeepersRanking.bind(this)
    ]

    const results = await Promise.allSettled(rankingEndpoints.map((fn) => fn()))
    return results
      .filter((result): result is PromiseFulfilledResult<Ranking> => result.status === 'fulfilled')
      .map((result) => result.value)
  }
}
