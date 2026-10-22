import api from './api'

export type ChampionshipStatus = 'draft' | 'active' | 'playoffs' | 'finished'
export type ChampionshipPhase = 'group' | 'semi_final' | 'challenger_final' | 'final'
export type ChampionshipPlayerType = 'field' | 'goalkeeper'

export interface ChampionshipPlayer {
  id: number
  player_id: number
  player_type: ChampionshipPlayerType
  stone_group: number
  stone_level?: number | null
  sport_position?: string | null
  player?: { id: number; name: string; nickname?: string | null; position?: string }
}

export interface ChampionshipTeam {
  id: number
  name: string
  crest_path?: string | null
  crest_url?: string | null
  players?: ChampionshipPlayer[]
}

export interface ChampionshipOdds {
  home_probability: number
  draw_probability: number
  away_probability: number
  home_odd: number
  draw_odd: number
  away_odd: number
  parameters?: { model?: string; [key: string]: unknown }
}

export interface ChampionshipMatchParticipation {
  championship_player_id: number
  mvp?: boolean
}

export interface ChampionshipMatchEvent {
  id: number
  minute?: number | null
  team_id?: number | null
  scorer_id?: number | null
  assist_id?: number | null
  own_goal?: boolean
  scorer?: { id: number; name: string } | null
  assist?: { id: number; name: string } | null
  player?: { id: number; name: string } | null
}

export interface ChampionshipMatch {
  id: number
  phase: ChampionshipPhase
  round: number | null
  status: 'scheduled' | 'finished' | 'cancelled'
  home_score: number | null
  away_score: number | null
  home_penalty_score?: number | null
  away_penalty_score?: number | null
  home_team: ChampionshipTeam
  away_team: ChampionshipTeam
  odds?: ChampionshipOdds | null
  participations?: ChampionshipMatchParticipation[]
  events?: ChampionshipMatchEvent[]
}

export interface ChampionshipStanding {
  position: number
  team_id: number
  name: string
  crest_path?: string | null
  points: number
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  win_rate: number
}

export interface ChampionshipDetails {
  championship: {
    id: number
    name: string
    status: ChampionshipStatus
    phase: string
    teams: ChampionshipTeam[]
    players?: ChampionshipPlayer[]
  }
  standings: ChampionshipStanding[]
  matches: ChampionshipMatch[]
  champion?: ChampionshipTeam | null
}

export interface ChampionshipSummary {
  id: number
  name: string
  status: ChampionshipStatus
  phase: string
  teams_count?: number
  players_count?: number
  matches_count?: number
}

export interface ChampionshipStatisticsRow {
  participant_id: number
  player: { id: number; name: string; nickname?: string | null; position?: string }
  position: ChampionshipPlayerType
  played: number
  wins: number
  draws: number
  losses: number
  goals: number
  assists: number
  goal_participations: number
  mvp: number
  goals_conceded: number
  clean_sheets: number
  goal_average: number
  assist_average: number
}

export interface ChampionshipAwardResult {
  id: number
  votes: number
  percentage: number
  winner?: ChampionshipPlayer
}

export interface ChampionshipAward {
  id: number
  name: string
  description?: string
  type: 'vote' | 'statistic'
  goalkeepers_only?: boolean
  published: boolean
  voting_open: boolean
  candidates?: ChampionshipPlayer[]
  results?: ChampionshipAwardResult[]
}

export interface ChampionshipVoterPlayerOption {
  id: number
  name: string
  nickname?: string | null
  player_type: ChampionshipPlayerType
}

export interface ChampionshipVoterSession {
  championship_player_id: number
  player: { name: string; nickname?: string | null }
}

export interface ChampionshipVoterCategoryStatus {
  id: number
  name: string
  type: 'vote' | 'statistic'
  voting_open: boolean
  published: boolean
  has_voted: boolean
}

export interface ChampionshipVoterStatus {
  voter: ChampionshipVoterSession
  categories: ChampionshipVoterCategoryStatus[]
}

export interface ChampionshipVoterAdminRecord {
  id: number
  championship_player_id: number
  player: { id: number; name: string; nickname?: string | null }
  categories_voted: Array<{ id: number; name: string }>
}

const payload = <T>(response: { data: T | { data: T } }): T => {
  const value = response.data
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data: T }).data
  }
  return value as T
}

export class ChampionshipService {
  static async list(): Promise<ChampionshipSummary[]> {
    return payload(await api.get('/championships'))
  }

  static async details(id: number): Promise<ChampionshipDetails> {
    return payload(await api.get(`/championships/${id}`))
  }

  static async create(name: string): Promise<ChampionshipSummary & { teams?: ChampionshipTeam[] }> {
    return payload(await api.post('/admin/championships', { name }))
  }

  static async generateFixtures(id: number): Promise<{ message: string }> {
    return payload(await api.post(`/admin/championships/${id}/fixtures`))
  }

  static async registerPlayer(id: number, payloadData: {
    player_id: number
    player_type: ChampionshipPlayerType
    stone_group: number
    stone_level: number | null
    team_id?: number | null
  }): Promise<ChampionshipPlayer> {
    return payload(await api.post(`/admin/championships/${id}/players`, payloadData))
  }

  static async assignPlayers(id: number, assignments: Array<{ team_id: number; championship_player_ids: number[] }>): Promise<{ message: string }> {
    return payload(await api.post(`/admin/championships/${id}/assignments`, { assignments }))
  }

  static async updateTeam(id: number, name: string): Promise<ChampionshipTeam> {
    return payload(await api.put(`/admin/championship-teams/${id}`, { name }))
  }

  static async updateMatch(id: number, data: {
    home_score: number
    away_score: number
    home_penalty_score?: number | null
    away_penalty_score?: number | null
    status: 'finished' | 'cancelled'
  }): Promise<ChampionshipMatch> {
    return payload(await api.put(`/admin/championship-matches/${id}`, data))
  }

  static async generatePlayoffs(id: number): Promise<{ message: string }> {
    return payload(await api.post(`/admin/championships/${id}/playoffs`))
  }

  static async resolveTie(id: number, data: { team_a_id: number; team_b_id: number; winner_id: number }): Promise<Record<string, unknown>> {
    return payload(await api.post(`/admin/championships/${id}/standings/tie-breaker`, data))
  }

  static async awards(id: number): Promise<ChampionshipAward[]> {
    return payload(await api.get(`/championships/${id}/awards`))
  }

  static async rankings(id: number, phase = 'all'): Promise<{
    scorers: ChampionshipStatisticsRow[]
    assists: ChampionshipStatisticsRow[]
    mvp: ChampionshipStatisticsRow[]
    goalkeepers: ChampionshipStatisticsRow[]
  }> {
    return payload(await api.get(`/championships/${id}/rankings`, { params: { phase } }))
  }

  static async statistics(id: number, phase = 'all'): Promise<ChampionshipStatisticsRow[]> {
    return payload(await api.get(`/championships/${id}/statistics`, { params: { phase } }))
  }

  static async vote(categoryId: number, candidateId: number): Promise<Record<string, unknown>> {
    return payload(await api.post(`/championship-awards/${categoryId}/votes`, { candidate_id: candidateId }))
  }

  static async voterPlayers(championshipId: number): Promise<ChampionshipVoterPlayerOption[]> {
    return payload(await api.get(`/championships/${championshipId}/voting/players`))
  }

  static async registerVoter(championshipId: number, championshipPlayerId: number, pin: string): Promise<{ token: string; voter: ChampionshipVoterSession }> {
    return payload(await api.post(`/championships/${championshipId}/voting/voters`, {
      championship_player_id: championshipPlayerId,
      pin,
      pin_confirmation: pin,
    }))
  }

  static async loginVoter(championshipId: number, championshipPlayerId: number, pin: string): Promise<{ token: string; voter: ChampionshipVoterSession }> {
    return payload(await api.post(`/championships/${championshipId}/voting/session`, {
      championship_player_id: championshipPlayerId,
      pin,
    }))
  }

  static async voterStatus(championshipId: number, token: string): Promise<ChampionshipVoterStatus> {
    return payload(await api.get(`/championships/${championshipId}/voting/session`, {
      headers: { 'X-Championship-Voter-Session': token },
    }))
  }

  static async logoutVoter(championshipId: number, token: string): Promise<void> {
    await api.delete(`/championships/${championshipId}/voting/session`, {
      headers: { 'X-Championship-Voter-Session': token },
    })
  }

  static async voteAsVoter(categoryId: number, candidateId: number, token: string): Promise<Record<string, unknown>> {
    return payload(await api.post(`/championship-votes/${categoryId}`, { candidate_id: candidateId }, {
      headers: { 'X-Championship-Voter-Session': token },
    }))
  }

  static async championshipVoters(championshipId: number): Promise<ChampionshipVoterAdminRecord[]> {
    return payload(await api.get(`/admin/championships/${championshipId}/voters`))
  }

  static async linkChampionshipVoter(voterId: number, championshipPlayerId: number): Promise<Pick<ChampionshipVoterAdminRecord, 'id' | 'championship_player_id' | 'player'>> {
    return payload(await api.put(`/admin/championship-voters/${voterId}/player`, {
      championship_player_id: championshipPlayerId,
    }))
  }

  static async resetChampionshipVoterPin(voterId: number, pin: string): Promise<{ message: string }> {
    return payload(await api.put(`/admin/championship-voters/${voterId}/pin`, {
      pin,
      pin_confirmation: pin,
    }))
  }

  static async uploadCrest(teamId: number, file: File): Promise<ChampionshipTeam> {
    const form = new FormData()
    form.append('crest', file)
    return payload(await api.post(`/admin/championship-teams/${teamId}/crest`, form))
  }

  static async removeCrest(teamId: number): Promise<ChampionshipTeam> {
    return payload(await api.delete(`/admin/championship-teams/${teamId}/crest`))
  }

  static async start(id: number): Promise<ChampionshipSummary> {
    return payload(await api.post(`/admin/championships/${id}/start`))
  }

  static async endVoting(id: number): Promise<ChampionshipAward[]> {
    return payload(await api.put(`/admin/championships/${id}/awards/voting-state`))
  }

  static async publishAwards(id: number): Promise<ChampionshipAward[]> {
    return payload(await api.post(`/admin/championships/${id}/awards/publish`))
  }

  static async setParticipation(matchId: number, playerIds: number[], mvpId?: number): Promise<ChampionshipMatchParticipation[]> {
    return payload(await api.post(`/admin/championship-matches/${matchId}/participation`, {
      championship_player_ids: playerIds,
      mvp_id: mvpId || null,
    }))
  }

  static async addEvent(matchId: number, data: {
    scorer_id: number | null
    assist_id: number | null
    team_id: number
    own_goal: boolean
    minute?: number | null
  }): Promise<Record<string, unknown>> {
    return payload(await api.post(`/admin/championship-matches/${matchId}/events`, data))
  }

  static async updateEvent(eventId: number, data: { minute?: number | null; own_goal?: boolean }): Promise<Record<string, unknown>> {
    return payload(await api.put(`/admin/championship-events/${eventId}`, data))
  }

  static async deleteEvent(eventId: number): Promise<{ message: string }> {
    return payload(await api.delete(`/admin/championship-events/${eventId}`))
  }

  static async calculateOdds(matchId: number): Promise<ChampionshipOdds> {
    return payload(await api.post(`/admin/championship-matches/${matchId}/odds`))
  }

  static async users(): Promise<Array<{ id: number; name: string; username: string; profile: string; player_id?: number | null }>> {
    return payload(await api.get('/admin/championship-users'))
  }

  static async linkUserPlayer(userId: number, playerId: number | null): Promise<Record<string, unknown>> {
    return payload(await api.put(`/admin/championship-users/${userId}/player`, { player_id: playerId }))
  }
}
