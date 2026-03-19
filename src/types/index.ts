export interface User {
  id: number
  name: string
  username: string
  profile: 'admin' | 'common'
  created_at: string
  updated_at: string
}

export interface Player {
  id: number
  name: string
  nickname: string
  position: 'linha' | 'goleiro'
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface UpdatePlayerRequest {
  name?: string
  nickname?: string
  position?: 'linha' | 'goleiro'
}

export interface Pelada {
  id: number
  date: string
  location: string
  qtd_times: number
  qtd_jogadores_por_time: number
  qtd_goleiros: number
  created_at: string
  updated_at: string
}

export interface CreatePeladaRequest {
  date: string
  location: string
  qtd_times: number
  qtd_jogadores_por_time: number
  qtd_goleiros: number
}

export interface MatchPlayer {
  id: number
  player_id: number
  pelada_id: number
  player: Player | null
  pelada: Pelada | null
  goals: number | null
  assists: number | null
  goals_conceded: number | null
  is_winner: boolean
  result: 'win' | 'loss' | 'draw'
  created_at: string
  updated_at: string
}

export interface CreateMatchPlayerRequest {
  player_id: number
  pelada_id: number
  goals?: number
  assists?: number
  goals_conceded?: number
  is_winner: boolean
  result: 'win' | 'loss' | 'draw'
}

export interface UpdateMatchPlayerRequest {
  goals?: number
  assists?: number
  goals_conceded?: number
  is_winner?: boolean
  result?: 'win' | 'loss' | 'draw'
}

export interface RankingPlayer {
  id: number
  name: string
  nickname: string
  position: 'linha' | 'goleiro'
  total: number
  matches: number
  average: number
}

export interface Ranking {
  type: string
  players: RankingPlayer[]
}

export interface Team {
  id: number
  name: string
  players: Player[]
}

export interface OrganizeTeamsRequest {
  player_ids: number[]
}

export interface OrganizeTeamsResponse {
  message: string
  teams: Team[]
}

export interface TeamField {
  field_name: string
  label: string
  team_number: number
}

export interface TeamFieldsResponse {
  pelada: Pick<Pelada, 'id' | 'date' | 'location' | 'qtd_times' | 'qtd_jogadores_por_time' | 'qtd_goleiros'>
  team_fields: TeamField[]
}

export interface PeladaPlayersItem extends Pick<Player, 'id' | 'name' | 'nickname' | 'position'> {
  is_goalkeeper: boolean
}

export interface PeladaPlayersResponse {
  pelada: Pick<Pelada, 'id' | 'date' | 'location'>
  players: PeladaPlayersItem[]
}

export interface TeamAssignmentEntry {
  team_number: number
  player_ids: number[]
}

export interface OrganizePeladaTeamsRequest {
  team_assignments: TeamAssignmentEntry[]
}

export interface OrganizedPeladaTeamsResponse {
  message: string
  teams: Array<{
    id: number
    name: string
    team_number?: number
    players: Array<Pick<Player, 'id' | 'name' | 'nickname' | 'position'>>
  }>
}

export interface PeladaStatisticsResponse {
  pelada: Pick<Pelada, 'id' | 'date' | 'location' | 'qtd_times' | 'qtd_jogadores_por_time' | 'qtd_goleiros'>
  statistics: {
    field_players: Array<{
      player: Pick<Player, 'id' | 'name' | 'nickname' | 'position'>
      statistics: {
        goals: number | null
        assists: number | null
        is_winner: boolean
        result: 'win' | 'loss' | 'draw'
        goal_participation: number
      }
    }>
    goalkeepers: Array<{
      player: Pick<Player, 'id' | 'name' | 'nickname' | 'position'>
      statistics: {
        goals: number | null
        assists: number | null
        is_winner: boolean
        result: 'win' | 'loss' | 'draw'
        goal_participation: number
        goals_conceded: number | null
      }
    }>
    total_players: number
    total_goals: number
    total_assists: number
    winners_count: number
    draws_count?: number
  }
}

export interface TeamsWithStatisticsResponse {
  pelada: Pick<Pelada, 'id' | 'date' | 'location' | 'qtd_times' | 'qtd_jogadores_por_time' | 'qtd_goleiros'>
  teams: Array<{
    id: number
    name: string
    players: Array<{
      id: number
      name: string
      nickname: string
      position: 'linha' | 'goleiro'
      statistics: {
        goals: number | null
        assists: number | null
        goals_conceded: number | null
        is_winner: boolean | number
        result: 'win' | 'loss' | 'draw'
        goal_participation: number
      } | null
    }>
  }>
  players?: Array<{
    id: number
    name: string
    nickname: string
    position: 'linha' | 'goleiro'
    statistics: {
      goals: number | null
      assists: number | null
      goals_conceded: number | null
      is_winner: boolean | number
      result: 'win' | 'loss' | 'draw'
      goal_participation: number
    } | null
    team: {
      id: number
      name: string
    } | null
  }>
}

export interface PlayerPeladaStatisticsResponse {
  player: Player
  pelada: Pelada
  statistics: {
    goals: number | null
    assists: number | null
    goals_conceded: number | null
    is_winner: boolean
    result: 'win' | 'loss' | 'draw'
    goal_participation: number
  }
}

export interface PlayerTotalStatisticsResponse {
  player: Player
  total_statistics: {
    total_goals: number
    total_assists: number
    total_goals_conceded: number
    total_matches: number
    total_wins: number
    total_losses: number
    total_draws: number
    win_rate: number
    avg_goal_participation: number
  }
}

export interface PlayerOverviewItem {
  player: Pick<Player, 'id' | 'name' | 'nickname' | 'position'>
  statistics: {
    total_matches: number
    total_wins: number
    total_goals: number
    total_assists: number
    avg_goal_participation: number
    avg_goals_per_match: number
    avg_assists_per_match: number
    total_goals_conceded: number | null
    eligible_for_ranking: boolean
  }
}

export interface PlayersOverviewResponse {
  reference_year: number
  total_peladas_in_year: number
  minimum_matches_for_ranking: number
  players: PlayerOverviewItem[]
}

export interface ApiError {
  message: string
  error?: string
  errors?: Record<string, string[]>
}

export interface MenuItem {
  name: string
  path: string
  icon: string
}

export interface CreatePlayerRequest {
  name: string
  nickname: string
  position: 'linha' | 'goleiro'
}
