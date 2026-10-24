import type { ChampionshipMatch } from '../services/championshipService'

const teamSnapshot = (team: ChampionshipMatch['home_team']): string => {
  const players = [...(team.players || [])]
    .sort((left, right) => left.id - right.id)
    .map((player) => [
      player.id,
      player.player_type,
      player.stone_group,
      player.stone_level == null ? '-' : Number(player.stone_level).toFixed(1),
    ].join(':'))
    .join(',')

  return `${team.id}[${players}]`
}

export const championshipResultsSignature = (matches: ChampionshipMatch[]): string => matches
  .filter((match) => match.status === 'finished' && match.home_score !== null && match.away_score !== null)
  .sort((left, right) => left.id - right.id)
  .map((match) => [match.id, match.home_team.id, match.away_team.id, match.home_score, match.away_score].join(':'))
  .join(';')

export const championshipRosterSignature = (match: ChampionshipMatch): string =>
  `${teamSnapshot(match.home_team)}|${teamSnapshot(match.away_team)}`

export const championshipOddsAreStale = (match: ChampionshipMatch, matches: ChampionshipMatch[]): boolean => {
  const parameters = match.odds?.parameters
  if (!match.odds || match.status !== 'scheduled') return false
  if (typeof parameters?.results_signature !== 'string' || typeof parameters?.roster_signature !== 'string') return true
  return parameters.results_signature !== championshipResultsSignature(matches)
    || parameters.roster_signature !== championshipRosterSignature(match)
}
