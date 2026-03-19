import api from './api'
import type { Ranking } from '../types'

export class RankingService {
  private static normalizeRanking(apiData: any): Ranking {
    if (apiData && typeof apiData === 'object' && 'ranking_type' in apiData && 'ranking' in apiData) {
      const players = Array.isArray(apiData.ranking)
        ? apiData.ranking.map((item: any) => {
            const player = item.player || {}
            const id = player.id ?? 0
            const name = player.name ?? '—'
            const nickname = player.nickname ?? ''
            const position = player.position ?? 'linha'

            let total = 0
            let matches = 0
            let average = 0

            if (item.total_assists !== undefined) {
              total = parseInt(String(item.total_assists)) || 0
              matches = parseInt(String(item.total_matches)) || 0
              average = parseFloat(String(item.avg_assists_per_match)) || 0
            } else if (item.total_goals !== undefined) {
              total = parseInt(String(item.total_goals)) || 0
              matches = parseInt(String(item.total_matches)) || 0
              average = parseFloat(String(item.avg_goals_per_match)) || 0
            } else if (item.total_wins !== undefined) {
              total = parseInt(String(item.total_wins)) || 0
              matches = parseInt(String(item.total_matches)) || 0
              if (item.win_rate) {
                average = parseFloat(String(item.win_rate).replace('%', '').trim()) || 0
              } else if (matches > 0) {
                average = (total / matches) * 100
              }
            } else if (item.total_goals_conceded !== undefined) {
              total = parseInt(String(item.total_goals_conceded)) || 0
              matches = parseInt(String(item.total_matches)) || 0
              average = parseFloat(String(item.avg_goals_conceded_per_match)) || 0
            } else if (item.total_goal_participation !== undefined) {
              total = parseInt(String(item.total_goal_participation)) || 0
              matches = parseInt(String(item.total_matches)) || 0
              average = parseFloat(String(item.avg_goal_participation)) || 0
            }

            return { id, name, nickname, position, total, matches, average }
          })
        : []

      return { type: apiData.ranking_type, players }
    }

    return apiData as Ranking
  }

  static async getWinsRanking(): Promise<Ranking> {
    const response = await api.get('/statistics/rankings/wins')
    return this.normalizeRanking((response as any).data?.data ?? response.data)
  }

  static async getGoalsRanking(): Promise<Ranking> {
    const response = await api.get('/statistics/rankings/goals')
    return this.normalizeRanking((response as any).data?.data ?? response.data)
  }

  static async getAssistsRanking(): Promise<Ranking> {
    const response = await api.get('/statistics/rankings/assists')
    return this.normalizeRanking((response as any).data?.data ?? response.data)
  }

  static async getGoalParticipationRanking(): Promise<Ranking> {
    const response = await api.get('/statistics/rankings/goal-participation')
    return this.normalizeRanking((response as any).data?.data ?? response.data)
  }

  static async getGoalkeepersRanking(): Promise<Ranking> {
    const response = await api.get('/statistics/rankings/goalkeepers')
    return this.normalizeRanking((response as any).data?.data ?? response.data)
  }

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
