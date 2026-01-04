import api from './api'
import type { Pelada, CreatePeladaRequest } from '../types'

export class PeladaService {
  static async createPelada(peladaData: CreatePeladaRequest): Promise<Pelada> {
    const response = await api.post<Pelada>('/peladas', peladaData)
    // API pode retornar { data: Pelada } ou Pelada diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Pelada
  }

  static async getAllPeladas(): Promise<Pelada[]> {
    const response = await api.get('/peladas')
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Pelada[]
  }

  static async getPeladasByDate(date: string): Promise<Pelada[]> {
    try {
      const response = await api.get(`/peladas/date/${date}`)
      const payload = (response as any).data?.data ?? (response as any).data
      return payload as Pelada[]
    } catch (e: any) {
      // API retorna 404 quando não há peladas na data
      if (e?.response?.status === 404) {
        return []
      }
      throw e
    }
  }

  static async getPelada(id: number): Promise<Pelada> {
    const response = await api.get(`/peladas/${id}`)
    console.log('Pelada API raw response:', response.data)
    // API pode retornar { data: Pelada } ou Pelada diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Pelada
  }

  static async updatePelada(id: number, peladaData: Partial<CreatePeladaRequest>): Promise<Pelada> {
    const response = await api.put<Pelada>(`/peladas/${id}`, peladaData)
    // API pode retornar { data: Pelada } ou Pelada diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as Pelada
  }

  static async deletePelada(id: number): Promise<void> {
    await api.delete(`/peladas/${id}`)
  }
}

