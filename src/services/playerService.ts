import api from './api'
import type { Player } from '../types'

export class PlayerService {
  static async getPlayer(id: number): Promise<Player> {
    const response = await api.get<Player>(`/players/${id}`)
    return (response as any).data?.data ?? response.data
  }

  static async getAllPlayers(): Promise<Player[]> {
    const response = await api.get<Player[]>('/players')
    return (response as any).data?.data ?? response.data
  }
}
