import api from './api'
import type {
  TeamFieldsResponse,
  PeladaPlayersResponse,
  OrganizePeladaTeamsRequest,
  OrganizedPeladaTeamsResponse
} from '../types'

export class TeamService {
  static async getTeamFields(peladaId: number): Promise<TeamFieldsResponse> {
    const response = await api.get<TeamFieldsResponse>(`/teams/pelada/${peladaId}/fields`)
    // API pode retornar { data: TeamFieldsResponse } ou TeamFieldsResponse diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as TeamFieldsResponse
  }

  static async getPeladaPlayers(peladaId: number): Promise<PeladaPlayersResponse> {
    const response = await api.get(`/teams/pelada/${peladaId}/players`)
    console.log('Pelada Players API raw response:', response.data)
    // API pode retornar { data: PeladaPlayersResponse } ou PeladaPlayersResponse diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as PeladaPlayersResponse
  }

  static async organizeTeams(peladaId: number, request: OrganizePeladaTeamsRequest): Promise<OrganizedPeladaTeamsResponse> {
    const response = await api.post<OrganizedPeladaTeamsResponse>(`/teams/pelada/${peladaId}/organize`, request)
    // API pode retornar { data: OrganizedPeladaTeamsResponse } ou OrganizedPeladaTeamsResponse diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload as OrganizedPeladaTeamsResponse
  }

  static async getOrganizedTeams(peladaId: number): Promise<OrganizedPeladaTeamsResponse | null> {
    try {
      const response = await api.get<OrganizedPeladaTeamsResponse>(`/teams/pelada/${peladaId}/organized`)
      // API pode retornar { data: OrganizedPeladaTeamsResponse } ou OrganizedPeladaTeamsResponse diretamente
      const payload = (response as any).data?.data ?? (response as any).data
      return payload as OrganizedPeladaTeamsResponse
    } catch (e: any) {
      // Se retornar 404, significa que os times ainda não foram organizados (situação esperada)
      if (e?.response?.status === 404) {
        return null
      }
      throw e
    }
  }

  /**
   * Busca times organizados com estatísticas dos jogadores
   * Retorna estrutura organizada por times com estatísticas anexadas
   */
  static async getTeamsWithStatistics(peladaId: number): Promise<any> {
    const response = await api.get(`/teams/pelada/${peladaId}/players-with-statistics`)
    // API pode retornar { data: ... } ou diretamente
    const payload = (response as any).data?.data ?? (response as any).data
    return payload
  }
}






