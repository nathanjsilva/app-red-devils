import api from './api'
import type { MatchPlayer, CreateMatchPlayerRequest, UpdateMatchPlayerRequest } from '../types'

export class MatchPlayerService {
  static async createMatchPlayer(matchData: CreateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.post<MatchPlayer>('/match-players', matchData)
    return response.data
  }

  static async updateMatchPlayer(id: number, matchData: UpdateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.put<MatchPlayer>(`/match-players/${id}`, matchData)
    return response.data
  }

  static async deleteMatchPlayer(id: number): Promise<void> {
    await api.delete(`/match-players/${id}`)
  }

  static async getPlayerStatisticsInPelada(playerId: number, peladaId: number): Promise<MatchPlayer> {
    const response = await api.get<MatchPlayer>(`/statistics/player/${playerId}/pelada/${peladaId}`)
    return response.data
  }
}

