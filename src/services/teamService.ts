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
    return response.data
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
    return response.data
  }

  static async getOrganizedTeams(peladaId: number): Promise<OrganizedPeladaTeamsResponse | null> {
    try {
      const response = await api.get<OrganizedPeladaTeamsResponse>(`/teams/pelada/${peladaId}`)
      return response.data
    } catch (e: any) {
      // Se retornar 404, significa que os times ainda não foram organizados (situação esperada)
      if (e?.response?.status === 404) {
        return null
      }
      throw e
    }
  }
}






