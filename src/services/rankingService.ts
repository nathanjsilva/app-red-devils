import api from './api'
import type { Ranking } from '../types'

export class RankingService {
  private static normalizeRanking(apiData: any): Ranking {
    // API nova: { ranking_type: string, ranking: any[] }
    if (apiData && typeof apiData === 'object' && 'ranking_type' in apiData && 'ranking' in apiData) {
      const players = Array.isArray(apiData.ranking) ? apiData.ranking.map((item: any) => {
        // Nova estrutura: item.player contém os dados do jogador
        const player = item.player || {}
        const id = player.id ?? 0
        const name = player.name ?? '—'
        const nickname = player.nickname ?? ''
        const position = player.position ?? 'linha'
        
        // Extrair total baseado no tipo de ranking
        let total = 0
        let matches = 0
        let average = 0
        
        // Assistências
        if (item.total_assists !== undefined) {
          total = parseInt(String(item.total_assists)) || 0
          matches = parseInt(String(item.total_matches)) || 0
          average = parseFloat(String(item.avg_assists_per_match)) || 0
        } 
        // Gols
        else if (item.total_goals !== undefined) {
          total = parseInt(String(item.total_goals)) || 0
          matches = parseInt(String(item.total_matches)) || 0
          average = parseFloat(String(item.avg_goals_per_match)) || 0
        } 
        // Vitórias
        else if (item.total_wins !== undefined) {
          total = parseInt(String(item.total_wins)) || 0
          matches = parseInt(String(item.total_matches)) || 0
          // Para vitórias, calcular média baseada em win_rate ou total_wins/total_matches
          if (item.win_rate) {
            // Converter win_rate de string "66.67%" para número
            const winRateStr = String(item.win_rate).replace('%', '').trim()
            average = parseFloat(winRateStr) || 0
          } else if (matches > 0) {
            // Calcular taxa de vitória: (total_wins / total_matches) * 100
            average = (total / matches) * 100
          } else {
            average = 0
          }
        } 
        // Goleiros (gols sofridos)
        else if (item.total_goals_conceded !== undefined) {
          total = parseInt(String(item.total_goals_conceded)) || 0
          matches = parseInt(String(item.total_matches)) || 0
          average = parseFloat(String(item.avg_goals_conceded_per_match)) || 0
        } 
        // Participação em gols
        else if (item.total_goal_participation !== undefined) {
          total = parseInt(String(item.total_goal_participation)) || 0
          matches = parseInt(String(item.total_matches)) || 0
          average = parseFloat(String(item.avg_goal_participation)) || 0
        }
        
        return { id, name, nickname, position, total, matches, average }
      }) : []

      return { type: apiData.ranking_type, players }
    }

    // Fallback: já está no formato esperado
    return apiData as Ranking
  }

  static async getWinsRanking(): Promise<Ranking> {
    const response = await api.get('/statistics/rankings/wins')
    return this.normalizeRanking(response.data)
  }

  static async getGoalsRanking(): Promise<Ranking> {
    const response = await api.get('/statistics/rankings/goals')
    return this.normalizeRanking(response.data)
  }

  static async getAssistsRanking(): Promise<Ranking> {
    const response = await api.get('/statistics/rankings/assists')
    return this.normalizeRanking(response.data)
  }

  static async getGoalParticipationRanking(): Promise<Ranking> {
    const response = await api.get('/statistics/rankings/goal-participation')
    return this.normalizeRanking(response.data)
  }

  static async getGoalkeepersRanking(): Promise<Ranking> {
    const response = await api.get('/statistics/rankings/goalkeepers')
    return this.normalizeRanking(response.data)
  }

  static async getAllRankings(): Promise<Ranking[]> {
    const rankingEndpoints = [
      { name: 'wins', fn: this.getWinsRanking.bind(this) },
      { name: 'goals', fn: this.getGoalsRanking.bind(this) },
      { name: 'assists', fn: this.getAssistsRanking.bind(this) },
      { name: 'goalParticipation', fn: this.getGoalParticipationRanking.bind(this) },
      { name: 'goalkeepers', fn: this.getGoalkeepersRanking.bind(this) }
    ]
  
    const results = await Promise.allSettled(
      rankingEndpoints.map(r => r.fn())
    )
  
    const rankings: Ranking[] = []
  
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const endpoint = rankingEndpoints[i]
  
      if (result.status === 'fulfilled') {
        rankings.push(result.value)
      } else {
        console.warn(`⚠️ Falha ao carregar ranking "${endpoint.name}":`, result.reason?.response?.data || result.reason)
        // simplesmente não adiciona nada à lista
      }
    }
  
    return rankings
  }  

  // Função para dados mockados (fallback)
  private static getMockRankings(): Ranking[] {
    return [
      {
        type: 'Gols',
        players: [
          { id: 1, name: 'Carlos', nickname: 'Carlos Gol', position: 'linha', total: 15, matches: 10, average: 1.5 },
          { id: 2, name: 'João', nickname: 'João Artilheiro', position: 'linha', total: 12, matches: 8, average: 1.5 },
          { id: 3, name: 'Pedro', nickname: 'Pedro Show', position: 'linha', total: 9, matches: 7, average: 1.29 }
        ]
      },
      {
        type: 'Assistências',
        players: [
          { id: 4, name: 'Pedro', nickname: 'Pedro Assist', position: 'linha', total: 11, matches: 7, average: 1.57 },
          { id: 5, name: 'Carlos', nickname: 'Carlos Pass', position: 'linha', total: 10, matches: 10, average: 1.0 },
          { id: 6, name: 'João', nickname: 'João Criativo', position: 'linha', total: 7, matches: 8, average: 0.88 }
        ]
      }
    ]
  }
}
