// Tipos principais da aplicação

export interface Player {
  id: number
  name: string
  email: string
  position: 'linha' | 'goleiro'
  phone: string
  nickname: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  player: Player
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  position: 'linha' | 'goleiro'
  phone: string
  nickname: string
}

export interface UpdatePlayerRequest {
  name?: string
  email?: string
  position?: 'linha' | 'goleiro'
  phone?: string
  nickname?: string
  old_password?: string
  new_password?: string
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
  goals: number
  assists: number
  is_winner: boolean
  goals_conceded?: number
  created_at: string
  updated_at: string
}

export interface CreateMatchPlayerRequest {
  player_id: number
  pelada_id: number
  goals: number
  assists: number
  is_winner: boolean
  goals_conceded?: number
}

export interface UpdateMatchPlayerRequest {
  goals?: number
  assists?: number
  is_winner?: boolean
  goals_conceded?: number
}

export interface PlayerStatistics {
  player_id: number
  total_goals: number
  total_assists: number
  total_wins: number
  total_matches: number
  goals_per_match: number
  assists_per_match: number
  win_rate: number
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

// ===== Times (público) =====
export interface TeamField {
  field_name: string
  label: string
  team_number: number
}

export interface TeamFieldsResponse {
  pelada: Pick<Pelada, 'id' | 'date' | 'location' | 'qtd_times' | 'qtd_jogadores_por_time' | 'qtd_goleiros'>
  team_fields: TeamField[]
}

export interface PeladaPlayersItem extends Pick<Player, 'id' | 'name' | 'nickname' | 'position' | 'phone'> {
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
        goals: number
        assists: number
        is_winner: boolean
        goal_participation: number
      }
    }>
    goalkeepers: Array<{
      player: Pick<Player, 'id' | 'name' | 'nickname' | 'position'>
      statistics: {
        goals: number
        assists: number
        is_winner: boolean
        goal_participation: number
        goals_conceded: number
      }
    }>
    total_players: number
    total_goals: number
    total_assists: number
    winners_count: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface MenuItem {
  name: string
  path: string
  icon: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  password_confirmation: string
}

export interface SetupFirstAdminRequest {
  name: string
  email: string
  password: string
  position: 'linha' | 'goleiro'
  phone: string
  nickname: string
}

export interface CreatePlayerRequest {
  name: string
  email: string
  password: string
  position: 'linha' | 'goleiro'
  phone: string
  nickname: string
  is_admin?: boolean
}
