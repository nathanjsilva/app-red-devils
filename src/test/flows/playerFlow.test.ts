import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayersStore } from '../../stores/players'
import { PlayerService } from '../../services/playerService'

// Mock do PlayerService
vi.mock('../../services/playerService', () => ({
  PlayerService: {
    getAllPlayers: vi.fn(),
    getPlayer: vi.fn(),
    updatePlayer: vi.fn(),
    deletePlayer: vi.fn(),
  }
}))

describe('Fluxo de Jogadores', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockPlayers = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@test.com',
      position: 'linha' as const,
      phone: '11999999999',
      nickname: 'João Gol',
      created_at: '2024-01-01 12:00:00',
      updated_at: '2024-01-01 12:00:00'
    },
    {
      id: 2,
      name: 'Pedro Santos',
      email: 'pedro@test.com',
      position: 'goleiro' as const,
      phone: '11888888888',
      nickname: 'Pedro Goleiro',
      created_at: '2024-01-01 12:00:00',
      updated_at: '2024-01-01 12:00:00'
    }
  ]

  describe('Listagem de Jogadores', () => {
    it('deve carregar todos os jogadores com sucesso', async () => {
      vi.mocked(PlayerService.getAllPlayers).mockResolvedValue(mockPlayers)

      const store = usePlayersStore()

      // Executar carregamento
      await store.fetchPlayers()

      // Verificar estado da store
      expect(store.players).toEqual(mockPlayers)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()

      // Verificar se service foi chamado
      expect(PlayerService.getAllPlayers).toHaveBeenCalled()
    })

    it('deve tratar erro ao carregar jogadores', async () => {
      const mockError = new Error('Erro de conexão')
      vi.mocked(PlayerService.getAllPlayers).mockRejectedValue(mockError)

      const store = usePlayersStore()

      // Executar carregamento
      await expect(store.fetchPlayers()).rejects.toThrow('Erro de conexão')

      // Verificar estado da store
      expect(store.players).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Erro ao carregar jogadores')
    })
  })

  describe('Busca de Jogador Específico', () => {
    it('deve buscar jogador por ID com sucesso', async () => {
      const mockPlayer = mockPlayers[0]
      vi.mocked(PlayerService.getPlayer).mockResolvedValue(mockPlayer)

      const store = usePlayersStore()

      // Executar busca
      const result = await store.fetchPlayer(1)

      // Verificar resultado
      expect(result).toEqual(mockPlayer)
      expect(store.currentPlayer).toEqual(mockPlayer)
      expect(store.isLoading).toBe(false)

      // Verificar se service foi chamado
      expect(PlayerService.getPlayer).toHaveBeenCalledWith(1)
    })
  })

  describe('Atualização de Jogador', () => {
    it('deve atualizar jogador com sucesso', async () => {
      const updatedPlayer = {
        ...mockPlayers[0],
        name: 'João Silva Atualizado',
        nickname: 'João Artilheiro'
      }

      vi.mocked(PlayerService.updatePlayer).mockResolvedValue(updatedPlayer)

      const store = usePlayersStore()
      store.players = [...mockPlayers]

      const updateData = {
        name: 'João Silva Atualizado',
        nickname: 'João Artilheiro'
      }

      // Executar atualização
      const result = await store.updatePlayer(1, updateData)

      // Verificar resultado
      expect(result).toEqual(updatedPlayer)
      expect(store.players[0]).toEqual(updatedPlayer)
      expect(store.isLoading).toBe(false)

      // Verificar se service foi chamado
      expect(PlayerService.updatePlayer).toHaveBeenCalledWith(1, updateData)
    })

    it('deve atualizar currentPlayer quando for o mesmo jogador', async () => {
      const updatedPlayer = {
        ...mockPlayers[0],
        name: 'João Silva Atualizado'
      }

      vi.mocked(PlayerService.updatePlayer).mockResolvedValue(updatedPlayer)

      const store = usePlayersStore()
      store.currentPlayer = mockPlayers[0]

      const updateData = { name: 'João Silva Atualizado' }

      // Executar atualização
      await store.updatePlayer(1, updateData)

      // Verificar que currentPlayer foi atualizado
      expect(store.currentPlayer).toEqual(updatedPlayer)
    })
  })

  describe('Exclusão de Jogador', () => {
    it('deve deletar jogador com sucesso', async () => {
      vi.mocked(PlayerService.deletePlayer).mockResolvedValue(undefined)

      const store = usePlayersStore()
      store.players = [...mockPlayers]

      // Executar exclusão
      await store.deletePlayer(1)

      // Verificar que jogador foi removido da lista
      expect(store.players).toHaveLength(1)
      expect(store.players[0].id).toBe(2)
      expect(store.isLoading).toBe(false)

      // Verificar se service foi chamado
      expect(PlayerService.deletePlayer).toHaveBeenCalledWith(1)
    })

    it('deve limpar currentPlayer quando for o mesmo jogador deletado', async () => {
      vi.mocked(PlayerService.deletePlayer).mockResolvedValue(undefined)

      const store = usePlayersStore()
      store.currentPlayer = mockPlayers[0]

      // Executar exclusão
      await store.deletePlayer(1)

      // Verificar que currentPlayer foi limpo
      expect(store.currentPlayer).toBeNull()
    })
  })

  describe('Gerenciamento de Estado', () => {
    it('deve limpar erro corretamente', () => {
      const store = usePlayersStore()
      store.error = 'Erro de teste'

      // Executar limpeza
      store.clearError()

      // Verificar que erro foi limpo
      expect(store.error).toBeNull()
    })

    it('deve manter estado de loading durante operações', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => {
        resolvePromise = resolve
      })

      vi.mocked(PlayerService.getAllPlayers).mockReturnValue(promise)

      const store = usePlayersStore()

      // Iniciar carregamento
      const loadingPromise = store.fetchPlayers()

      // Verificar que está carregando
      expect(store.isLoading).toBe(true)

      // Resolver promise
      resolvePromise!(mockPlayers)
      await loadingPromise

      // Verificar que parou de carregar
      expect(store.isLoading).toBe(false)
    })
  })
})

