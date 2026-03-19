import api from './api'
import type {
  OrganizedPeladaTeamsResponse,
  OrganizePeladaTeamsRequest,
  PeladaPlayersResponse,
  TeamsWithStatisticsResponse,
  TeamFieldsResponse
} from '../types'

export class TeamService {
  static async getTeamFields(peladaId: number): Promise<TeamFieldsResponse> {
    const response = await api.get<TeamFieldsResponse>(`/admin/teams/pelada/${peladaId}/fields`)
    return (response as any).data?.data ?? response.data
  }

  static async getPeladaPlayers(peladaId: number): Promise<PeladaPlayersResponse> {
    const response = await api.get<PeladaPlayersResponse>(`/admin/teams/pelada/${peladaId}/players`)
    return (response as any).data?.data ?? response.data
  }

  static async organizeTeams(peladaId: number, request: OrganizePeladaTeamsRequest): Promise<OrganizedPeladaTeamsResponse> {
    const response = await api.post<OrganizedPeladaTeamsResponse>(`/admin/teams/pelada/${peladaId}/organize`, request)
    return (response as any).data?.data ?? response.data
  }

  static async getOrganizedTeams(peladaId: number): Promise<OrganizedPeladaTeamsResponse | null> {
    try {
      const response = await api.get<OrganizedPeladaTeamsResponse>(`/admin/teams/pelada/${peladaId}/organized`)
      return (response as any).data?.data ?? response.data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  static async getTeamsWithStatistics(peladaId: number): Promise<TeamsWithStatisticsResponse> {
    const response = await api.get<TeamsWithStatisticsResponse>(`/admin/teams/pelada/${peladaId}/players-with-statistics`)
    return (response as any).data?.data ?? response.data
  }
}
