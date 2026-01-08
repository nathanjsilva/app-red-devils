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
  OrganizeTeamsResponse,
  User
} from '../types'

export class AdminService {
  // ===== GERENCIAMENTO DE USUÁRIOS (ADMIN) =====
  
  static async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/admin/users')
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as User[]
  }

  // ===== GERENCIAMENTO DE JOGADORES (ADMIN) =====
  
  static async createPlayer(playerData: CreatePlayerRequest): Promise<Player> {
    const response = await api.post<Player>('/admin/players', playerData)
    // API pode retornar { data: Player } ou Player diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Player
  }

  static async updatePlayer(id: number, playerData: UpdatePlayerRequest): Promise<Player> {
    const response = await api.put<Player>(`/admin/players/${id}`, playerData)
    // API pode retornar { data: Player } ou Player diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Player
  }

  static async deletePlayer(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/admin/players/${id}`)
    // API pode retornar { data: {...} } ou diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload
  }

  static async makeAdmin(id: number): Promise<{ message: string; player: Player }> {
    const response = await api.post(`/admin/players/${id}/make-admin`)
    // API pode retornar { data: {...} } ou diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload
  }

  static async removeAdmin(id: number): Promise<{ message: string; player: Player }> {
    const response = await api.post(`/admin/players/${id}/remove-admin`)
    // API pode retornar { data: {...} } ou diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload
  }

  // ===== GERENCIAMENTO DE PELADAS (ADMIN) =====

  static async createPelada(peladaData: CreatePeladaRequest): Promise<Pelada> {
    const response = await api.post<Pelada>('/admin/peladas', peladaData)
    // API pode retornar { data: Pelada } ou Pelada diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Pelada
  }

  static async updatePelada(id: number, peladaData: Partial<CreatePeladaRequest>): Promise<Pelada> {
    const response = await api.put<Pelada>(`/admin/peladas/${id}`, peladaData)
    // API pode retornar { data: Pelada } ou Pelada diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Pelada
  }

  static async deletePelada(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/admin/peladas/${id}`)
    // API pode retornar { data: {...} } ou diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload
  }

  // ===== ESTATÍSTICAS (ADMIN) =====

  static async createMatchPlayer(matchPlayerData: CreateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.post<MatchPlayer>('/admin/match-players', matchPlayerData)
    // API pode retornar { data: MatchPlayer } ou MatchPlayer diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as MatchPlayer
  }

  static async updateMatchPlayer(id: number, matchPlayerData: UpdateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.put<MatchPlayer>(`/admin/match-players/${id}`, matchPlayerData)
    // API pode retornar { data: MatchPlayer } ou MatchPlayer diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as MatchPlayer
  }

  static async updatePlayerStatistics(peladaId: number, playerId: number, statisticsData: UpdateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.put<MatchPlayer>(`/admin/peladas/${peladaId}/players/${playerId}/statistics`, statisticsData)
    // API pode retornar { data: MatchPlayer } ou MatchPlayer diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as MatchPlayer
  }

  static async deleteMatchPlayer(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/admin/match-players/${id}`)
    // API pode retornar { data: {...} } ou diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload
  }

  // ===== ORGANIZAÇÃO DE TIMES =====

  static async organizeTeams(peladaId: number, playerIds: number[]): Promise<OrganizeTeamsResponse> {
    const requestData: OrganizeTeamsRequest = { player_ids: playerIds }
    const response = await api.post<OrganizeTeamsResponse>(`/admin/peladas/${peladaId}/organize-teams`, requestData)
    // API pode retornar { data: OrganizeTeamsResponse } ou OrganizeTeamsResponse diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as OrganizeTeamsResponse
  }
}