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
  division: 'quinta' | 'sabado'
  location: string
  qtd_times: number
  qtd_jogadores_por_time: number
  qtd_goleiros: number
  created_at: string
  updated_at: string
}

export interface CreatePeladaRequest {
  date: string
  division: 'quinta' | 'sabado'
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

/**
 * `position` significa coisas diferentes conforme a config da pelada:
 * - `qtd_goleiros >= qtd_times`: `position` é o `team_number` (goleiro fixo daquele time).
 * - `qtd_goleiros < qtd_times`: `position` é o número da posição de gol (1..qtd_goleiros),
 *   independente do time de linha que estiver ocupando essa posição durante o revezamento.
 */
export interface GoalkeeperAssignmentEntry {
  position: number
  player_id: number
}

export interface OrganizePeladaTeamsRequest {
  team_assignments: TeamAssignmentEntry[]
  goalkeeper_assignments?: GoalkeeperAssignmentEntry[]
}

export interface GoalPositionEntry {
  numero: number
  goleiro: Pick<Player, 'id' | 'name' | 'nickname' | 'position'> | null
}

export interface OrganizedPeladaTeamsResponse {
  message: string
  teams: Array<{
    id: number
    name: string
    team_number?: number
    players: Array<Pick<Player, 'id' | 'name' | 'nickname' | 'position'>>
  }>
  goal_positions?: GoalPositionEntry[]
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
  /**
   * Goleiros vinculados a uma posição de gol (não a um time de linha) — presente
   * apenas quando `qtd_goleiros < qtd_times`, cenário em que os times de linha se
   * revezam nas mesmas posições/goleiros ao longo da pelada.
   */
  goal_positions?: Array<{
    numero: number
    id: number | null
    name: string | null
    nickname: string | null
    position: 'goleiro' | null
    statistics: {
      goals: number | null
      assists: number | null
      goals_conceded: number | null
      is_winner: boolean | number
      result: 'win' | 'loss' | 'draw'
      goal_participation: number
    } | null
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
  players: {
    data: PlayerOverviewItem[]
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
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

export interface StatisticsFilters {
  start_date?: string
  end_date?: string
  year?: number | string
  month?: number | string
  division?: 'quinta' | 'sabado'
}

export interface StatLeader {
  player: Pick<Player, 'id' | 'name' | 'nickname' | 'position'>
  matches: number
  value: number
  average_per_match: number
}

export interface DashboardOverview {
  total_peladas: number
  total_players: number
  total_goals: number
  total_assists: number
  total_goal_participations: number
  avg_goals_per_pelada: number
  avg_assists_per_pelada: number
  avg_players_per_pelada: number
  pelada_with_most_goals: { pelada_id: number; date: string; location: string; total_goals: number } | null
  top_scorer: StatLeader | null
  top_assister: StatLeader | null
  top_goal_participation: StatLeader | null
  most_wins: StatLeader | null
  best_win_rate: StatLeader | null
  best_goalkeeper: StatLeader | null
  best_duo: {
    players: Array<Pick<Player, 'id' | 'name' | 'nickname'>>
    matches_together: number
    wins_together: number
    win_rate_together: number
  } | null
  minimum_matches_for_leaders: number
}

export interface EvolutionPoint {
  period: string
  total_peladas: number
  total_goals: number
  total_assists: number
  total_goal_participations: number
  total_goals_conceded: number
  avg_goals: number
  avg_assists: number
  total_players: number
}

export interface PeladaHistoryEntry {
  pelada_id: number
  date: string
  location: string
  division: 'quinta' | 'sabado'
  result: 'win' | 'loss' | 'draw'
  goals: number | null
  assists: number | null
  is_top_scorer: boolean
  is_top_assister: boolean
  goals_conceded: number | null
}

export interface GoalkeeperRankingItem {
  player: Pick<Player, 'id' | 'name' | 'nickname'>
  matches: number
  wins: number
  win_rate: number
  goals_conceded: number
  avg_goals_conceded_per_match: number
  best_match_goals_conceded: number
  worst_match_goals_conceded: number
  goals: number
  assists: number
}

export interface GoalkeeperDetail {
  player: Pick<Player, 'id' | 'name' | 'nickname'>
  total_matches: number
  total_goals: number
  total_assists: number
  total_goal_participations: number
  total_wins: number
  total_losses: number
  total_draws: number
  win_rate: number
  avg_goals_per_match: number
  avg_assists_per_match: number
  avg_goal_participations_per_match: number
  pct_matches_scoring: number
  pct_matches_assisting: number
  pct_matches_participating: number
  best_goals_in_a_match: number
  best_assists_in_a_match: number
  best_scoring_streak: number
  best_participation_streak: number
  best_unbeaten_streak: number
  attendance_rate: number
  best_duo: {
    players: Array<Pick<Player, 'id' | 'name' | 'nickname'>>
    matches_together: number
    wins_together: number
    win_rate_together: number
  } | null
  recent_form: {
    matches: Array<{ pelada_id: number; date: string; goals: number | null; assists: number | null; result: 'win' | 'loss' | 'draw' }>
    trend: string
  }
  goals_conceded: number | null
  best_match_goals_conceded: number | null
  worst_match_goals_conceded: number | null
}

export interface PeladasPerMonthPoint {
  period: string
  total_peladas: number
}

export interface MatchDetail {
  field_players: Array<{
    player: Pick<Player, 'id' | 'name' | 'nickname' | 'position'>
    statistics: { goals: number; assists: number; result: 'win' | 'loss' | 'draw'; goal_participation: number }
  }>
  goalkeepers: Array<{
    player: Pick<Player, 'id' | 'name' | 'nickname' | 'position'>
    statistics: { goals: number; assists: number; result: 'win' | 'loss' | 'draw'; goal_participation: number; goals_conceded: number }
  }>
  total_players: number
  total_goals: number
  total_assists: number
  winners_count: number
  draws_count: number
  avg_goals_per_player: number
  top_scorer: { players: Array<Pick<Player, 'id' | 'name' | 'nickname'>>; value: number } | null
  top_assister: { players: Array<Pick<Player, 'id' | 'name' | 'nickname'>>; value: number } | null
  top_goal_participation: { players: Array<Pick<Player, 'id' | 'name' | 'nickname'>>; value: number } | null
  team_results: Array<{ team_id: number; name: string; total_goals: number; result: 'win' | 'loss' | 'draw' }>
  goal_difference: number
}

export interface PlayerProfile {
  player: Pick<Player, 'id' | 'name' | 'nickname' | 'position'>
  total_matches: number
  total_goals: number
  total_assists: number
  total_goal_participations: number
  total_wins: number
  total_losses: number
  total_draws: number
  win_rate: number
  avg_goals_per_match: number
  avg_assists_per_match: number
  avg_goal_participations_per_match: number
  pct_matches_scoring: number
  pct_matches_assisting: number
  pct_matches_participating: number
  best_goals_in_a_match: number
  best_assists_in_a_match: number
  best_scoring_streak: number
  best_participation_streak: number
  best_unbeaten_streak: number
  attendance_rate: number
  best_duo: {
    players: Array<Pick<Player, 'id' | 'name' | 'nickname'>>
    matches_together: number
    wins_together: number
    win_rate_together: number
  } | null
  recent_form: {
    matches: Array<{ pelada_id: number; date: string; goals: number | null; assists: number | null; result: 'win' | 'loss' | 'draw' }>
    trend: string
  }
  evolution: EvolutionPoint[]
  goals_conceded: number | null
  pelada_history: PeladaHistoryEntry[]
}

export interface ComparePlayerEntry {
  player: Pick<Player, 'id' | 'name' | 'nickname' | 'position'>
  total_matches: number
  total_goals: number
  total_assists: number
  total_goal_participations: number
  total_wins: number
  win_rate: number
  avg_goals_per_match: number
  avg_assists_per_match: number
  avg_goal_participations_per_match: number
  radar: {
    total_goals: number
    total_assists: number
    total_goal_participations: number
    win_rate: number
    avg_goal_participations_per_match: number
  }
}
