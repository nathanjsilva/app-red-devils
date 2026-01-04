import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../stores/auth'
import { usePlayersStore } from '../../stores/players'
import { useRankingsStore } from '../../stores/rankings'
import { usePeladasStore } from '../../stores/peladas'
import { AuthService } from '../../services/authService'
import { PlayerService } from '../../services/playerService'
import { RankingService } from '../../services/rankingService'
import { PeladaService } from '../../services/peladaService'

// Mocks dos serviços
vi.mock('../../services/authService')
vi.mock('../../services/playerService')
vi.mock('../../services/rankingService')
vi.mock('../../services/peladaService')

describe('Fluxo de Integração Completo', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Não limpar localStorage aqui para permitir que os testes funcionem
  })

  const mockUser = {
    id: 1,
    name: 'João Silva',
    email: 'joao@test.com',
    position: 'linha' as const,
    phone: '11999999999',
    nickname: 'João Gol',
    created_at: '2024-01-01 12:00:00',
    updated_at: '2024-01-01 12:00:00'
  }

  const mockPlayers = [
    mockUser,
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
        }
      ]
    }
  ]

  const mockPeladas = [
    {
      id: 1,
      date: '2024-12-25',
      location: 'Campo do Bairro',
      qtd_times: 2,
      qtd_jogadores_por_time: 6,
      qtd_goleiros: 2,
      created_at: '2024-01-01 12:00:00',
      updated_at: '2024-01-01 12:00:00'
    }
  ]

  describe('Fluxo Completo de Usuário', () => {
    it('deve executar fluxo completo: login -> carregar dados -> visualizar dashboard', async () => {
      // Mock das respostas da API
      vi.mocked(AuthService.login).mockResolvedValue({
        data: {
          access_token: '1|abcdef123456789',
          token_type: 'Bearer',
          player: mockUser
        }
      })

      vi.mocked(PlayerService.getAllPlayers).mockResolvedValue(mockPlayers)
      vi.mocked(RankingService.getAllRankings).mockResolvedValue(mockRankings)
      vi.mocked(PeladaService.getAllPeladas).mockResolvedValue(mockPeladas)

      // Inicializar stores
      const authStore = useAuthStore()
      const playersStore = usePlayersStore()
      const rankingsStore = useRankingsStore()
      const peladasStore = usePeladasStore()

      // 1. Login do usuário
      await authStore.login({
        email: 'joao@test.com',
        password: 'MinhaSenh@123'
      })

      // Verificar autenticação
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user).toEqual(mockUser)
      expect(localStorage.getItem('token')).toBe('Bearer 1|abcdef123456789')

      // 2. Carregar dados do dashboard
      await Promise.all([
        playersStore.fetchPlayers(),
        rankingsStore.fetchRankings(),
        peladasStore.fetchPeladas()
      ])

      // Verificar dados carregados
      expect(playersStore.players).toEqual(mockPlayers)
      expect(rankingsStore.rankings).toEqual(mockRankings)
      expect(peladasStore.peladas).toEqual(mockPeladas)

      // 3. Verificar estado final
      expect(authStore.isAuthenticated).toBe(true)
      expect(playersStore.isLoading).toBe(false)
      expect(rankingsStore.isLoading).toBe(false)
      expect(peladasStore.isLoading).toBe(false)
    })

    it('deve executar fluxo de atualização de perfil', async () => {
      // Mock inicial
      vi.mocked(AuthService.login).mockResolvedValue({
        data: {
          access_token: '1|abcdef123456789',
          token_type: 'Bearer',
          player: mockUser
        }
      })

      const updatedUser = {
        ...mockUser,
        name: 'João Silva Atualizado',
        nickname: 'João Artilheiro'
      }

      vi.mocked(PlayerService.updatePlayer).mockResolvedValue(updatedUser)

      // Inicializar stores
      const authStore = useAuthStore()
      const playersStore = usePlayersStore()

      // 1. Login
      await authStore.login({
        email: 'joao@test.com',
        password: 'MinhaSenh@123'
      })

      // 2. Atualizar perfil
      const updateData = {
        name: 'João Silva Atualizado',
        nickname: 'João Artilheiro'
      }

      await playersStore.updatePlayer(mockUser.id, updateData)

      // Verificar atualização
      expect(playersStore.currentPlayer).toEqual(updatedUser)
      expect(PlayerService.updatePlayer).toHaveBeenCalledWith(mockUser.id, updateData)
    })

    it('deve executar fluxo de logout e limpeza de dados', async () => {
      // Mock inicial
      vi.mocked(AuthService.login).mockResolvedValue({
        data: {
          access_token: '1|abcdef123456789',
          token_type: 'Bearer',
          player: mockUser
        }
      })

      vi.mocked(PlayerService.getAllPlayers).mockResolvedValue(mockPlayers)
      vi.mocked(RankingService.getAllRankings).mockResolvedValue(mockRankings)

      // Inicializar stores
      const authStore = useAuthStore()
      const playersStore = usePlayersStore()
      const rankingsStore = useRankingsStore()

      // 1. Login e carregar dados
      await authStore.login({
        email: 'joao@test.com',
        password: 'MinhaSenh@123'
      })

      await Promise.all([
        playersStore.fetchPlayers(),
        rankingsStore.fetchRankings()
      ])

      // Verificar dados carregados
      expect(authStore.isAuthenticated).toBe(true)
      expect(playersStore.players).toHaveLength(2)
      expect(rankingsStore.rankings).toHaveLength(1)

      // 2. Logout
      await authStore.logout()

      // Verificar limpeza
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('player')).toBeNull()

      // Dados das outras stores devem permanecer (não são limpos no logout)
      expect(playersStore.players).toHaveLength(2)
      expect(rankingsStore.rankings).toHaveLength(1)
    })
  })

  describe('Fluxo de Tratamento de Erros', () => {
    it('deve tratar erro de autenticação e manter estado consistente', async () => {
      // Mock de erro de login
      vi.mocked(AuthService.login).mockRejectedValue(new Error('Credenciais inválidas'))

      const authStore = useAuthStore()

      // Tentar login
      await expect(authStore.login({
        email: 'joao@test.com',
        password: 'senhaerrada'
      })).rejects.toThrow('Credenciais inválidas')

      // Verificar que estado permanece inalterado
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('deve tratar erro de carregamento de dados e manter autenticação', async () => {
      // Mock de login bem-sucedido
      vi.mocked(AuthService.login).mockResolvedValue({
        data: {
          access_token: '1|abcdef123456789',
          token_type: 'Bearer',
          player: mockUser
        }
      })

      // Mock de erro ao carregar rankings
      vi.mocked(RankingService.getAllRankings).mockRejectedValue(new Error('Erro de conexão'))

      const authStore = useAuthStore()
      const rankingsStore = useRankingsStore()

      // 1. Login bem-sucedido
      await authStore.login({
        email: 'joao@test.com',
        password: 'MinhaSenh@123'
      })

      // 2. Tentar carregar rankings (com erro)
      try {
        await rankingsStore.fetchRankings()
      } catch (error) {
        // Verificar que erro foi capturado
        expect(error.message).toBe('Erro de conexão')
      }

      // Verificar que autenticação permanece
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user).toEqual(mockUser)

      // Verificar que ranking tem erro
      expect(rankingsStore.error).toBe('Erro ao carregar rankings')
      expect(rankingsStore.rankings).toEqual([])
    })
  })

  describe('Fluxo de Persistência de Dados', () => {
    it('deve restaurar sessão completa do localStorage', () => {
      // Simular dados salvos no localStorage
      localStorage.setItem('token', 'Bearer 1|abcdef123456789')
      localStorage.setItem('player', JSON.stringify(mockUser))

      const authStore = useAuthStore()

      // Inicializar autenticação
      authStore.initializeAuth()

      // Verificar restauração
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe('Bearer 1|abcdef123456789')
    })

    it('deve limpar dados corrompidos do localStorage', () => {
      // Simular dados corrompidos
      localStorage.setItem('token', 'Bearer 1|abcdef123456789')
      localStorage.setItem('player', 'dados-corrompidos')

      const authStore = useAuthStore()

      // Inicializar autenticação
      authStore.initializeAuth()

      // Verificar que dados foram limpos
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('player')).toBeNull()
    })
  })

  describe('Fluxo de Performance', () => {
    it('deve carregar dados em paralelo para melhor performance', async () => {
      // Mock das respostas
      vi.mocked(AuthService.login).mockResolvedValue({
        data: {
          access_token: '1|abcdef123456789',
          token_type: 'Bearer',
          player: mockUser
        }
      })

      vi.mocked(PlayerService.getAllPlayers).mockResolvedValue(mockPlayers)
      vi.mocked(RankingService.getAllRankings).mockResolvedValue(mockRankings)
      vi.mocked(PeladaService.getAllPeladas).mockResolvedValue(mockPeladas)

      const authStore = useAuthStore()
      const playersStore = usePlayersStore()
      const rankingsStore = useRankingsStore()
      const peladasStore = usePeladasStore()

      // Login
      await authStore.login({
        email: 'joao@test.com',
        password: 'MinhaSenh@123'
      })

      // Medir tempo de carregamento paralelo
      const startTime = Date.now()
      
      await Promise.all([
        playersStore.fetchPlayers(),
        rankingsStore.fetchRankings(),
        peladasStore.fetchPeladas()
      ])

      const endTime = Date.now()
      const loadTime = endTime - startTime

      // Verificar que todos os dados foram carregados
      expect(playersStore.players).toEqual(mockPlayers)
      expect(rankingsStore.rankings).toEqual(mockRankings)
      expect(peladasStore.peladas).toEqual(mockPeladas)

      // Verificar que carregamento foi rápido (simulado)
      expect(loadTime).toBeLessThan(1000) // Menos de 1 segundo
    })
  })
})
