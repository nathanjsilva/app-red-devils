import api from './api'
import type { MatchPlayer, CreateMatchPlayerRequest, UpdateMatchPlayerRequest } from '../types'

/**
 * @deprecated Use AdminService.createMatchPlayer instead
 * Este serviço mantém apenas métodos não administrativos
 * Rotas administrativas foram movidas para AdminService
 */
export class MatchPlayerService {
  /**
   * @deprecated Use AdminService.createMatchPlayer instead
   * Esta rota requer permissões de admin: POST /admin/match-players
   */
  static async createMatchPlayer(matchData: CreateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.post<MatchPlayer>('/admin/match-players', matchData)
    // API pode retornar { data: MatchPlayer } ou MatchPlayer diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as MatchPlayer
  }

  /**
   * @deprecated Use AdminService.updateMatchPlayer instead
   * Esta rota requer permissões de admin: PUT /admin/match-players/{id}
   */
  static async updateMatchPlayer(id: number, matchData: UpdateMatchPlayerRequest): Promise<MatchPlayer> {
    const response = await api.put<MatchPlayer>(`/admin/match-players/${id}`, matchData)
    // API pode retornar { data: MatchPlayer } ou MatchPlayer diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as MatchPlayer
  }

  /**
   * @deprecated Use AdminService.deleteMatchPlayer instead
   * Esta rota requer permissões de admin: DELETE /admin/match-players/{id}
   */
  static async deleteMatchPlayer(id: number): Promise<void> {
    await api.delete(`/admin/match-players/${id}`)
  }

  /**
   * Busca estatísticas de um jogador em uma pelada específica
   * Rota pública (autenticada): GET /statistics/player/{playerId}/pelada/{peladaId}
   */
  static async getPlayerStatisticsInPelada(playerId: number, peladaId: number): Promise<MatchPlayer> {
    const response = await api.get<MatchPlayer>(`/statistics/player/${playerId}/pelada/${peladaId}`)
    // API pode retornar { data: MatchPlayer } ou MatchPlayer diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as MatchPlayer
  }
}

