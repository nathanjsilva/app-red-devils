import api from './api'
import type { Player, UpdatePlayerRequest } from '../types'

export class PlayerService {
  static async getPlayer(id: number): Promise<Player> {
    const response = await api.get<Player>(`/players/${id}`)
    // API pode retornar { data: Player } ou Player diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Player
  }

  static async updatePlayer(id: number, playerData: UpdatePlayerRequest): Promise<Player> {
    const response = await api.put<Player>(`/players/${id}`, playerData)
    // API pode retornar { data: Player } ou Player diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Player
  }

  static async getAllPlayers(): Promise<Player[]> {
    const response = await api.get('/players')
    // API pode retornar { data: Player[] }
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Player[]
  }

  static async deletePlayer(id: number): Promise<void> {
    await api.delete(`/players/${id}`)
  }
}
