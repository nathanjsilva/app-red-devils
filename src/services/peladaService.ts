import api from './api'
import type { CreatePeladaRequest, Pelada } from '../types'

export class PeladaService {
  static async createPelada(peladaData: CreatePeladaRequest): Promise<Pelada> {
    const response = await api.post<Pelada>('/admin/peladas', peladaData)
    return (response as any).data?.data ?? response.data
  }

  static async getAllPeladas(division?: 'quinta' | 'sabado'): Promise<Pelada[]> {
    const response = await api.get<Pelada[]>('/peladas', { params: { per_page: 100, division } })
    return (response as any).data?.data ?? response.data
  }

  static async getPeladasByDate(date: string): Promise<Pelada[]> {
    try {
      const response = await api.get<Pelada[]>(`/peladas/date/${date}`)
      return (response as any).data?.data ?? response.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return []
      }
      throw error
    }
  }

  static async getPelada(id: number): Promise<Pelada> {
    const response = await api.get<Pelada>(`/peladas/${id}`)
    return (response as any).data?.data ?? response.data
  }

  static async updatePelada(id: number, peladaData: Partial<CreatePeladaRequest>): Promise<Pelada> {
    const response = await api.put<Pelada>(`/admin/peladas/${id}`, peladaData)
    return (response as any).data?.data ?? response.data
  }

  static async deletePelada(id: number): Promise<void> {
    await api.delete(`/admin/peladas/${id}`)
  }
}
