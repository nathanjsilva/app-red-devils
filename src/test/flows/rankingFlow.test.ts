import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRankingsStore } from '../../stores/rankings'
import { RankingService } from '../../services/rankingService'

// Mock do RankingService
vi.mock('../../services/rankingService', () => ({
  RankingService: {
    getAllRankings: vi.fn(),
    getWinsRanking: vi.fn(),
    getGoalsRanking: vi.fn(),
    getAssistsRanking: vi.fn(),
    getGoalkeepersRanking: vi.fn(),
  }
}))

describe('Fluxo de Rankings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockRankings = [
    {
      type: 'Gols',
      players: [
        {
          id: 1,
          name: 'João Silva',
          nickname: 'João Gol',
          position: 'linha' as const,
          total: 15,
          matches: 10,
          average: 1.5
        },
        {
          id: 2,
          name: 'Pedro Santos',
          nickname: 'Pedro Artilheiro',
          position: 'linha' as const,
          total: 12,
          matches: 8,
          average: 1.5
        }
      ]
    },
    {
      type: 'Assistências',
      players: [
        {
          id: 3,
          name: 'Carlos Lima',
          nickname: 'Carlos Pass',
          position: 'linha' as const,
          total: 10,
          matches: 10,
          average: 1.0
        },
        {
          id: 4,
          name: 'Ana Costa',
          nickname: 'Ana Criativa',
          position: 'linha' as const,
          total: 8,
          matches: 7,
          average: 1.14
        }
      ]
    }
  ]

  describe('Carregamento de Rankings', () => {
    it('deve carregar todos os rankings com sucesso', async () => {
      vi.mocked(RankingService.getAllRankings).mockResolvedValue(mockRankings)

      const store = useRankingsStore()

      // Executar carregamento
      await store.fetchRankings()

      // Verificar estado da store
      expect(store.rankings).toEqual(mockRankings)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()

      // Verificar se service foi chamado
      expect(RankingService.getAllRankings).toHaveBeenCalled()
    })

    it('deve tratar erro ao carregar rankings', async () => {
      const mockError = new Error('Erro de conexão')
      vi.mocked(RankingService.getAllRankings).mockRejectedValue(mockError)

      const store = useRankingsStore()

      // Executar carregamento
      try {
        await store.fetchRankings()
      } catch (error) {
        // Verificar que erro foi capturado
        expect(error).toBe(mockError)
      }

      // Verificar estado da store
      expect(store.rankings).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Erro ao carregar rankings')
    })
  })

  describe('Rankings Específicos', () => {
    it('deve buscar ranking de gols', async () => {
      const goalsRanking = mockRankings[0]
      vi.mocked(RankingService.getGoalsRanking).mockResolvedValue(goalsRanking)

      const store = useRankingsStore()

      // Executar busca
      const result = await store.fetchGoalsRanking()

      // Verificar resultado
      expect(result).toEqual(goalsRanking)
      expect(RankingService.getGoalsRanking).toHaveBeenCalled()
    })

    it('deve buscar ranking de assistências', async () => {
      const assistsRanking = mockRankings[1]
      vi.mocked(RankingService.getAssistsRanking).mockResolvedValue(assistsRanking)

      const store = useRankingsStore()

      // Executar busca
      const result = await store.fetchAssistsRanking()

      // Verificar resultado
      expect(result).toEqual(assistsRanking)
      expect(RankingService.getAssistsRanking).toHaveBeenCalled()
    })

    it('deve buscar ranking de vitórias', async () => {
      const winsRanking = {
        type: 'Vitórias',
        players: [
          {
            id: 1,
            name: 'João Silva',
            nickname: 'João Vencedor',
            position: 'linha' as const,
            total: 8,
            matches: 10,
            average: 0.8
          }
        ]
      }

      vi.mocked(RankingService.getWinsRanking).mockResolvedValue(winsRanking)

      const store = useRankingsStore()

      // Executar busca
      const result = await store.fetchWinsRanking()

      // Verificar resultado
      expect(result).toEqual(winsRanking)
      expect(RankingService.getWinsRanking).toHaveBeenCalled()
    })

    it('deve buscar ranking de goleiros', async () => {
      const goalkeepersRanking = {
        type: 'Goleiros',
        players: [
          {
            id: 2,
            name: 'Pedro Santos',
            nickname: 'Pedro Goleiro',
            position: 'goleiro' as const,
            total: 3,
            matches: 5,
            average: 0.6
          }
        ]
      }

      vi.mocked(RankingService.getGoalkeepersRanking).mockResolvedValue(goalkeepersRanking)

      const store = useRankingsStore()

      // Executar busca
      const result = await store.fetchGoalkeepersRanking()

      // Verificar resultado
      expect(result).toEqual(goalkeepersRanking)
      expect(RankingService.getGoalkeepersRanking).toHaveBeenCalled()
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erro ao buscar ranking específico', async () => {
      const mockError = new Error('Erro ao buscar ranking')
      vi.mocked(RankingService.getGoalsRanking).mockRejectedValue(mockError)

      const store = useRankingsStore()

      // Executar busca
      await expect(store.fetchGoalsRanking()).rejects.toThrow('Erro ao buscar ranking')
    })

    it('deve limpar erro corretamente', () => {
      const store = useRankingsStore()
      store.error = 'Erro de teste'

      // Executar limpeza
      store.clearError()

      // Verificar que erro foi limpo
      expect(store.error).toBeNull()
    })
  })

  describe('Gerenciamento de Estado', () => {
    it('deve manter estado de loading durante operações', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      vi.mocked(RankingService.getAllRankings).mockReturnValue(promise)

      const store = useRankingsStore()

      // Iniciar carregamento
      const loadingPromise = store.fetchRankings()

      // Verificar que está carregando
      expect(store.isLoading).toBe(true)

      // Resolver promise
      resolvePromise!(mockRankings)
      await loadingPromise

      // Verificar que parou de carregar
      expect(store.isLoading).toBe(false)
    })

    it('deve inicializar com estado vazio', () => {
      const store = useRankingsStore()

      // Verificar estado inicial
      expect(store.rankings).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })
})
