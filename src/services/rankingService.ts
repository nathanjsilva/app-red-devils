import api from './api'
import type { Ranking } from '../types'

export class RankingService {
  static async getRankings(): Promise<Ranking[]> {
    const response = await api.get<Ranking[]>('/rankings')
    return response.data
  }

  static async getGoalsRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/rankings/goals')
    return response.data
  }

  static async getAssistsRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/rankings/assists')
    return response.data
  }

  static async getGoalsPerGameRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/rankings/goals-per-game')
    return response.data
  }

  static async getAssistsPerGameRanking(): Promise<Ranking> {
    const response = await api.get<Ranking>('/rankings/assists-per-game')
    return response.data
  }
}
