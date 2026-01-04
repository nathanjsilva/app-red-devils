import api from './api'
import type { 
  Player, 
  CreatePlayerRequest, 
  UpdatePlayerRequest,
  Pelada,
  CreatePeladaRequest,
  MatchPlayer,
  CreateMatchPlayerRequest,
  UpdateMatchPlayerRequest,
  OrganizeTeamsRequest,
  OrganizeTeamsResponse
} from '../types'

export class AdminService {
  // ===== GERENCIAMENTO DE JOGADORES (ADMIN) =====
  
  static async createPlayer(playerData: CreatePlayerRequest): Promise<Player> {
    const response = await api.post<Player>('/admin/players', playerData)
    return response.data
  }

  static async updatePlayer(id: number, playerData: UpdatePlayerRequest): Promise<Player> {
    const response = await api.put<Player>(`/admin/players/${id}`, playerData)
    return response.data
  }

  static async deletePlayer(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/admin/players/${id}`)
    return response.data
  }

  static async makeAdmin(id: number): Promise<{ message: string; player: Player }> {
    const response = await api.post(`/admin/players/${id}/make-admin`)
    return response.data
  }

  static async removeAdmin(id: number): Promise<{ message: string; player: Player }> {
    const response = await api.post(`/admin/players/${id}/remove-admin`)
    return response.data
  }

  // ===== GERENCIAMENTO DE PELADAS (ADMIN) =====

  static async createPelada(peladaData: CreatePeladaRequest): Promise<Pelada> {
    const response = await api.post<Pelada>('/admin/peladas', peladaData)
    return response.data
  }

  static async updatePelada(id: number, peladaData: Partial<CreatePeladaRequest>): Promise<Pelada> {
    const response = await api.put<Pelada>(`/admin/peladas/${id}`, peladaData)
    return response.data
  }

  static async deletePelada(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/admin/peladas/${id}`)
    return response.data
  }

  // ===== ESTATÍSTICAS (ADMIN) =====

  static async createMatchPlayer(matchPlayerData: CreateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.post<MatchPlayer>('/admin/match-players', matchPlayerData)
    return response.data
  }

  static async updateMatchPlayer(id: number, matchPlayerData: UpdateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.put<MatchPlayer>(`/admin/match-players/${id}`, matchPlayerData)
    return response.data
  }

  static async updatePlayerStatistics(peladaId: number, playerId: number, statisticsData: UpdateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.put<MatchPlayer>(`/admin/peladas/${peladaId}/players/${playerId}/statistics`, statisticsData)
    return response.data
  }

  static async deleteMatchPlayer(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/admin/match-players/${id}`)
    return response.data
  }

  // ===== ORGANIZAÇÃO DE TIMES =====

  static async organizeTeams(peladaId: number, playerIds: number[]): Promise<OrganizeTeamsResponse> {
    const requestData: OrganizeTeamsRequest = { player_ids: playerIds }
    const response = await api.post<OrganizeTeamsResponse>(`/admin/peladas/${peladaId}/organize-teams`, requestData)
    return response.data
  }
}