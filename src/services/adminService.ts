import api from './api'
import type {
  CreateMatchPlayerRequest,
  CreatePeladaRequest,
  CreatePlayerRequest,
  MatchPlayer,
  OrganizeTeamsRequest,
  OrganizeTeamsResponse,
  Pelada,
  Player,
  UpdateMatchPlayerRequest,
  UpdatePlayerRequest
} from '../types'

export class AdminService {
  static async createPlayer(playerData: CreatePlayerRequest): Promise<Player> {
    const response = await api.post<Player>('/admin/players', playerData)
    return (response as any).data?.data ?? response.data
  }

  static async updatePlayer(id: number, playerData: UpdatePlayerRequest): Promise<Player> {
    const response = await api.put<Player>(`/admin/players/${id}`, playerData)
    return (response as any).data?.data ?? response.data
  }

  static async deletePlayer(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/admin/players/${id}`)
    return (response as any).data?.data ?? response.data
  }

  static async createPelada(peladaData: CreatePeladaRequest): Promise<Pelada> {
    const response = await api.post<Pelada>('/admin/peladas', peladaData)
    return (response as any).data?.data ?? response.data
  }

  static async updatePelada(id: number, peladaData: Partial<CreatePeladaRequest>): Promise<Pelada> {
    const response = await api.put<Pelada>(`/admin/peladas/${id}`, peladaData)
    return (response as any).data?.data ?? response.data
  }

  static async deletePelada(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/admin/peladas/${id}`)
    return (response as any).data?.data ?? response.data
  }

  static async createMatchPlayer(matchPlayerData: CreateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.post<MatchPlayer>('/admin/match-players', matchPlayerData)
    return (response as any).data?.data ?? response.data
  }

  static async updateMatchPlayer(id: number, matchPlayerData: UpdateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.put<MatchPlayer>(`/admin/match-players/${id}`, matchPlayerData)
    return (response as any).data?.data ?? response.data
  }

  static async updatePlayerStatistics(peladaId: number, playerId: number, statisticsData: UpdateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.put<MatchPlayer>(`/admin/peladas/${peladaId}/players/${playerId}/statistics`, statisticsData)
    return (response as any).data?.data ?? response.data
  }

  static async deleteMatchPlayer(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/admin/match-players/${id}`)
    return (response as any).data?.data ?? response.data
  }

  static async organizeTeams(peladaId: number, playerIds: number[]): Promise<OrganizeTeamsResponse> {
    const requestData: OrganizeTeamsRequest = { player_ids: playerIds }
    const response = await api.post<OrganizeTeamsResponse>(`/admin/peladas/${peladaId}/organize-teams`, requestData)
    return (response as any).data?.data ?? response.data
  }
}
