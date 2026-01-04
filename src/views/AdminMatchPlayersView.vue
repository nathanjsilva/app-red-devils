<template>
  <div class="container py-4">
    <h2 class="mb-3">Admin · Estatísticas</h2>

    <!-- Informações da Pelada -->
    <div v-if="selectedPelada" class="card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5 class="card-title mb-1">Pelada: {{ selectedPelada.location }}</h5>
            <p class="text-muted mb-0">
              <strong>Data:</strong> {{ formatDate(selectedPelada.date) }} |
              <strong>ID:</strong> #{{ selectedPelada.id }}
            </p>
          </div>
          <button class="btn btn-outline-secondary btn-sm" @click="clearSelection">
            Trocar Pelada
          </button>
        </div>
      </div>
    </div>

    <div v-if="!selectedPelada" class="card mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">Selecionar Pelada</h5>
        <form class="row g-3" @submit.prevent="loadPeladaData">
          <div class="col-md-12">
            <label class="form-label">Pelada</label>
            <select v-model.number="form.pelada_id" class="form-select" @change="loadPeladaData" :disabled="allPeladas.length === 0 || isLoadingPeladas" required>
              <option :value="undefined" disabled selected>Selecione a pelada</option>
              <option v-for="p in allPeladas" :key="p.id" :value="p.id">
                {{ p.location }} ({{ formatDate(p.date) }})
              </option>
            </select>
            <div v-if="isLoadingPeladas" class="mt-2 text-muted small">Carregando peladas...</div>
          </div>
        </form>
      </div>
    </div>

    <!-- Seção para adicionar novo jogador -->
    <div v-if="selectedPelada && !isLoadingPlayers" class="card mb-4">
      <div class="card-body">
        <h5 class="card-title mb-3">Adicionar Jogador às Estatísticas</h5>
        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label">Selecione um jogador</label>
            <select 
              v-model="newPlayerId" 
              class="form-select"
              :disabled="availablePlayers.length === 0 || isAddingPlayer"
            >
              <option :value="null" disabled selected>
                {{ availablePlayers.length === 0 ? 'Todos os jogadores já têm estatísticas cadastradas' : 'Selecione um jogador' }}
              </option>
              <option 
                v-for="player in availablePlayers" 
                :key="player.id" 
                :value="player.id"
              >
                #{{ player.id }} · {{ player.nickname }} ({{ player.position }})
              </option>
            </select>
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <button 
              class="btn btn-primary w-100"
              @click="addNewPlayer"
              :disabled="!newPlayerId || isAddingPlayer"
            >
              {{ isAddingPlayer ? 'Adicionando...' : 'Adicionar Jogador' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela de Jogadores com Estatísticas -->
    <div v-if="selectedPelada && playerStats.length > 0" class="card">
      <div class="card-body">
        <h5 class="card-title mb-3">Estatísticas dos Jogadores</h5>
        <p class="text-muted small mb-3">
          Exibindo {{ playerStats.length }} jogador{{ playerStats.length !== 1 ? 'es' : '' }} com estatísticas cadastradas nesta pelada
        </p>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>Jogador</th>
                <th>Posição</th>
                <th>Gols</th>
                <th>Assistências</th>
                <th>Gols Sofridos</th>
                <th>Vencedor</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="playerStat in playerStats" :key="playerStat.player.id">
                <td>
                  <strong>{{ playerStat.player.nickname }}</strong><br>
                  <small class="text-muted">{{ playerStat.player.name }}</small>
                </td>
                <td>
                  <span class="badge" :class="(playerStat.player.position === 'goleiro' || playerStat.player.is_goalkeeper) ? 'bg-info' : 'bg-secondary'">
                    {{ (playerStat.player.position === 'goleiro' || playerStat.player.is_goalkeeper) ? 'goleiro' : 'linha' }}
                  </span>
                </td>
                <td>
                  <input
                    v-model.number="playerStat.statistics.goals"
                    type="number"
                    class="form-control form-control-sm"
                    style="width: 80px;"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    v-model.number="playerStat.statistics.assists"
                    type="number"
                    class="form-control form-control-sm"
                    style="width: 80px;"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    v-if="playerStat.player.position === 'goleiro' || playerStat.player.is_goalkeeper"
                    v-model.number="playerStat.statistics.goals_conceded"
                    type="number"
                    class="form-control form-control-sm"
                    style="width: 80px;"
                    min="0"
                  />
                  <span v-else class="text-muted">—</span>
                </td>
                <td>
                  <input
                    v-model="playerStat.statistics.is_winner"
                    type="checkbox"
                    class="form-check-input"
                  />
                </td>
                <td class="text-end">
                  <button
                    class="btn btn-sm btn-primary"
                    @click="savePlayerStatistics(playerStat)"
                    :disabled="isSaving === playerStat.player.id"
                  >
                    {{ isSaving === playerStat.player.id ? 'Salvando...' : 'Salvar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Mensagem quando não há estatísticas -->
    <div v-else-if="selectedPelada && !isLoadingPlayers && playerStats.length === 0" class="alert alert-info">
      <h5>Nenhuma estatística encontrada</h5>
      <p class="mb-0">
        Esta pelada ainda não possui estatísticas cadastradas. As estatísticas serão exibidas aqui após serem registradas.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoadingPlayers" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3 text-muted">Carregando dados da pelada...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { AdminService } from '../services/adminService'
import { PeladaService } from '../services/peladaService'
import { StatisticsService } from '../services/statisticsService'
import { TeamService } from '../services/teamService'
import { PlayerService } from '../services/playerService'
import type { Pelada, PeladaPlayersItem, PeladaStatisticsResponse, UpdateMatchPlayerRequest, Player } from '../types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const selectedPelada = ref<Pelada | null>(null)
const allPeladas = ref<Pelada[]>([])
const isLoadingPlayers = ref(false)
const isLoadingPeladas = ref(false)
const isSaving = ref<number | null>(null)
const isAddingPlayer = ref(false)
const newPlayerId = ref<number | null>(null)
const allPlayersList = ref<Player[]>([])

interface PlayerWithStatistics {
  player: PeladaPlayersItem
  statistics: {
    goals: number
    assists: number
    is_winner: boolean
    goals_conceded?: number
    matchPlayerId?: number
  }
}

const playerStats = ref<PlayerWithStatistics[]>([])

// Form
const form = ref({
  pelada_id: 0
})

// Jogadores disponíveis (que não têm estatísticas cadastradas ainda)
const availablePlayers = computed(() => {
  const playerIdsWithStats = new Set(playerStats.value.map(ps => ps.player.id))
  return allPlayersList.value.filter(p => !playerIdsWithStats.has(p.id))
})

// Função para formatar data
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Data não informada'
  try {
    // Adiciona timezone para evitar problemas de fuso horário
    const date = new Date(dateString + 'T00:00:00')
    if (isNaN(date.getTime())) {
      return dateString
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (e) {
    return dateString
  }
}

// Carregar pelada quando há query param
const loadPeladaById = async (peladaId: number) => {
  isLoadingPlayers.value = true
  playerStats.value = []
  newPlayerId.value = null
  
  try {
    // 1. Buscar dados da pelada
    const peladaData = await PeladaService.getPelada(peladaId)
    selectedPelada.value = peladaData
    
    // Atualizar o select para refletir a pelada selecionada
    form.value.pelada_id = peladaId

    console.log('✅ Pelada carregada:', {
      id: selectedPelada.value.id,
      date: selectedPelada.value.date,
      location: selectedPelada.value.location
    })

    // Carregar todos os jogadores disponíveis (para poder adicionar novos)
    try {
      const playersResponse = await PlayerService.getAllPlayers()
      allPlayersList.value = Array.isArray(playersResponse) ? playersResponse : (playersResponse as any).data || []
      console.log('✅ Jogadores carregados:', allPlayersList.value.length)
    } catch (e: any) {
      console.warn('⚠️ Erro ao carregar jogadores:', e)
      allPlayersList.value = []
    }

    // 2. Buscar estatísticas da pelada (já vem com os jogadores que têm estatísticas)
    try {
      const statisticsResponse = await StatisticsService.getPeladaStatistics(peladaId)
      console.log('✅ Estatísticas carregadas:', {
        field_players: statisticsResponse.statistics.field_players?.length || 0,
        goalkeepers: statisticsResponse.statistics.goalkeepers?.length || 0
      })

      // Criar lista de jogadores a partir das estatísticas (apenas jogadores que têm estatísticas)
      playerStats.value = []

      // Adicionar jogadores de linha
      if (statisticsResponse.statistics.field_players) {
        statisticsResponse.statistics.field_players.forEach(fp => {
          playerStats.value.push({
            player: {
              id: fp.player.id,
              name: fp.player.name || 'Sem nome',
              nickname: fp.player.nickname || `Jogador ${fp.player.id}`,
              position: fp.player.position || 'linha',
              phone: '', // Não vem nas estatísticas
              is_goalkeeper: false
            },
            statistics: {
              goals: Number(fp.statistics.goals) || 0,
              assists: Number(fp.statistics.assists) || 0,
              is_winner: typeof fp.statistics.is_winner === 'boolean' 
                ? fp.statistics.is_winner 
                : (typeof fp.statistics.is_winner === 'number' ? fp.statistics.is_winner === 1 : false),
              goals_conceded: 0,
              matchPlayerId: undefined
            }
          })
        })
      }

      // Adicionar goleiros
      if (statisticsResponse.statistics.goalkeepers) {
        statisticsResponse.statistics.goalkeepers.forEach(gk => {
          playerStats.value.push({
            player: {
              id: gk.player.id,
              name: gk.player.name || 'Sem nome',
              nickname: gk.player.nickname || `Jogador ${gk.player.id}`,
              position: gk.player.position || 'goleiro',
              phone: '', // Não vem nas estatísticas
              is_goalkeeper: true
            },
            statistics: {
              goals: Number(gk.statistics.goals) || 0,
              assists: Number(gk.statistics.assists) || 0,
              is_winner: typeof gk.statistics.is_winner === 'boolean' 
                ? gk.statistics.is_winner 
                : (typeof gk.statistics.is_winner === 'number' ? gk.statistics.is_winner === 1 : false),
              goals_conceded: Number(gk.statistics.goals_conceded) || 0,
              matchPlayerId: undefined
            }
          })
        })
      }

      console.log('🔍 Debug final:', {
        totalJogadores: playerStats.value.length,
        jogadores: playerStats.value.map(ps => ({
          nome: ps.player.nickname,
          gols: ps.statistics.goals,
          assists: ps.statistics.assists,
          vencedor: ps.statistics.is_winner,
          goals_conceded: ps.statistics.goals_conceded
        }))
      })
    } catch (e: any) {
      if (e?.response?.status === 404) {
        // Se não há estatísticas, mostrar mensagem
        console.log('ℹ️ Nenhuma estatística cadastrada nesta pelada (404)')
        playerStats.value = []
        toast.info('Esta pelada ainda não possui estatísticas cadastradas')
      } else {
        console.error('❌ Erro ao carregar estatísticas:', e)
        toast.error('Erro ao carregar estatísticas da pelada')
        throw e
      }
    }

    // matchPlayerId será buscado apenas quando o usuário salvar as estatísticas
    // Isso evita fazer muitas requisições desnecessárias em background
  } catch (e: any) {
    console.error('❌ Erro ao carregar dados da pelada:', e)
    // O erro de estatísticas já foi tratado acima com toast, então apenas logar
    if (e?.response?.status !== 404) {
      toast.error(`Falha ao carregar dados da pelada: ${e?.message || 'Erro desconhecido'}`)
    }
  } finally {
    isLoadingPlayers.value = false
  }
}

const loadAllPeladas = async () => {
  isLoadingPeladas.value = true
  try {
    const response = await PeladaService.getAllPeladas()
    allPeladas.value = Array.isArray(response) ? response : (response as any).data || []
    // Ordenar por data em ordem ascendente (mais antiga primeiro)
    allPeladas.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    console.log('✅ Peladas carregadas:', allPeladas.value.length)
  } catch (e: any) {
    console.error(e)
    toast.error('Falha ao buscar peladas')
  } finally {
    isLoadingPeladas.value = false
  }
}

const loadPeladaData = async () => {
  if (!form.value.pelada_id) return
  await loadPeladaById(form.value.pelada_id)
}

const clearSelection = () => {
  selectedPelada.value = null
  playerStats.value = []
  form.value.pelada_id = 0
  router.replace({ name: 'AdminMatchPlayers' })
}

// Salvar estatísticas de um jogador
const savePlayerStatistics = async (playerStat: PlayerWithStatistics) => {
  isSaving.value = playerStat.player.id
  
  try {
    const statsData: UpdateMatchPlayerRequest = {
      goals: playerStat.statistics.goals || 0,
      assists: playerStat.statistics.assists || 0,
      // Converter boolean para true/false (API deve aceitar)
      is_winner: playerStat.statistics.is_winner,
      goals_conceded: (playerStat.player.position === 'goleiro' || playerStat.player.is_goalkeeper)
        ? (playerStat.statistics.goals_conceded || 0) 
        : undefined
    }

    // Usar a nova rota simplificada: PUT /admin/peladas/{peladaId}/players/{playerId}/statistics
    // A rota cria se não existe ou atualiza se já existe
    const result = await AdminService.updatePlayerStatistics(
      selectedPelada.value!.id,
      playerStat.player.id,
      statsData
    )
    
    // Atualizar o matchPlayerId se retornado
    if (result?.id) {
      playerStat.statistics.matchPlayerId = result.id
    }
    
    toast.success(`Estatísticas de ${playerStat.player.nickname} salvas com sucesso`)
  } catch (e: any) {
    console.error('Erro ao salvar estatísticas:', e)
    toast.error(`Falha ao salvar estatísticas de ${playerStat.player.nickname}: ${e?.response?.data?.message || e?.message || 'Erro desconhecido'}`)
  } finally {
    isSaving.value = null
  }
}

// Adicionar novo jogador às estatísticas
const addNewPlayer = async () => {
  if (!newPlayerId.value || !selectedPelada.value) return
  
  isAddingPlayer.value = true
  
  try {
    // Buscar dados do jogador
    const player = allPlayersList.value.find(p => p.id === newPlayerId.value)
    if (!player) {
      toast.error('Jogador não encontrado')
      return
    }
    
    // Criar entrada inicial com valores padrão
    const newPlayerStat: PlayerWithStatistics = {
      player: {
        id: player.id,
        name: player.name,
        nickname: player.nickname,
        position: player.position,
        phone: player.phone,
        is_goalkeeper: player.position === 'goleiro'
      },
      statistics: {
        goals: 0,
        assists: 0,
        is_winner: false,
        goals_conceded: player.position === 'goleiro' ? 0 : undefined
      }
    }
    
    // Adicionar à lista
    playerStats.value.push(newPlayerStat)
    
    // Limpar seleção
    newPlayerId.value = null
    
    toast.success(`${player.nickname} adicionado. Preencha as estatísticas e clique em "Salvar".`)
  } catch (e: any) {
    console.error('Erro ao adicionar jogador:', e)
    toast.error(`Falha ao adicionar jogador: ${e?.message || 'Erro desconhecido'}`)
  } finally {
    isAddingPlayer.value = false
  }
}


// Carregar pelada quando a página carrega com query param
onMounted(async () => {
  // Carregar todas as peladas primeiro
  await loadAllPeladas()
  
  const peladaId = route.query.pelada_id
  if (peladaId) {
    const id = parseInt(String(peladaId))
    if (!isNaN(id)) {
      // Verificar se a pelada existe na lista
      const peladaExists = allPeladas.value.find(p => p.id === id)
      if (peladaExists) {
        form.value.pelada_id = id
        await loadPeladaById(id)
      } else {
        console.error('Pelada não encontrada na lista:', id)
        toast.error('Pelada não encontrada')
      }
    } else {
      console.error('ID de pelada inválido:', peladaId)
      toast.error('ID de pelada inválido')
    }
  }
})

// Watch para recarregar quando o query param mudar
watch(() => route.query.pelada_id, async (newPeladaId) => {
  if (newPeladaId) {
    const id = parseInt(String(newPeladaId))
    if (!isNaN(id)) {
      // Verificar se a pelada existe na lista
      const peladaExists = allPeladas.value.find(p => p.id === id)
      if (peladaExists) {
        form.value.pelada_id = id
        await loadPeladaById(id)
      }
    }
  } else {
    selectedPelada.value = null
    playerStats.value = []
    form.value.pelada_id = 0
  }
})
</script>

<style scoped>
.btn-red { 
  background-color: var(--red-devils); 
  color: #fff; 
}
.btn-red:hover { 
  background-color: var(--red-devils-hover); 
}
</style>