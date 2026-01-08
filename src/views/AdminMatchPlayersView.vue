<template>
  <div class="container py-4">
    <h2 class="mb-3">Admin · Estatísticas</h2>

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
            <select 
              v-model.number="form.pelada_id" 
              class="form-select" 
              @change="loadPeladaData" 
              :disabled="allPeladas.length === 0 || isLoadingPeladas" 
              required
            >
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

    <div v-if="selectedPelada && playerStats.length > 0" class="card">
      <div class="card-body">
        <h5 class="card-title mb-3">Estatísticas dos Jogadores</h5>
        <p class="text-muted small mb-3">
          Exibindo {{ playerStats.length }} jogador{{ playerStats.length !== 1 ? 'es' : '' }} desta pelada
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
                  <span class="badge" :class="playerStat.player.position === 'goleiro' ? 'bg-info' : 'bg-secondary'">
                    {{ playerStat.player.position }}
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
                    v-if="playerStat.player.position === 'goleiro'"
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

    <div v-else-if="selectedPelada && !isLoadingPlayers && playerStats.length === 0" class="alert alert-info">
      <h5>Nenhum jogador encontrado</h5>
      <p class="mb-0">
        Esta pelada não possui jogadores organizados ou ainda não possui estatísticas cadastradas.
      </p>
    </div>

    <div v-if="isLoadingPlayers" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3 text-muted">Carregando dados da pelada...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { AdminService } from '../services/adminService'
import { PeladaService } from '../services/peladaService'
import { TeamService } from '../services/teamService'
import type { Pelada, PeladaPlayersItem, UpdateMatchPlayerRequest, TeamsWithStatisticsResponse } from '../types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const selectedPelada = ref<Pelada | null>(null)
const allPeladas = ref<Pelada[]>([])
const isLoadingPlayers = ref(false)
const isLoadingPeladas = ref(false)
const isSaving = ref<number | null>(null)

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

const form = ref({
  pelada_id: 0
})

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Data não informada'
  try {
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

const loadPeladaById = async (peladaId: number) => {
  isLoadingPlayers.value = true
  playerStats.value = []
  
  try {
    const teamsResponse = await TeamService.getTeamsWithStatistics(peladaId)
    
    selectedPelada.value = {
      id: teamsResponse.pelada.id,
      date: teamsResponse.pelada.date,
      location: teamsResponse.pelada.location,
      qtd_times: teamsResponse.pelada.qtd_times,
      qtd_jogadores_por_time: teamsResponse.pelada.qtd_jogadores_por_time,
      qtd_goleiros: teamsResponse.pelada.qtd_goleiros,
      created_at: '',
      updated_at: ''
    }
    
    form.value.pelada_id = peladaId

    playerStats.value = []
    teamsResponse.teams.forEach(team => {
      team.players.forEach(player => {
        const isGoalkeeper = player.position === 'goleiro'
        
        playerStats.value.push({
          player: {
            id: player.id,
            name: player.name || 'Sem nome',
            nickname: player.nickname || `Jogador ${player.id}`,
            position: (player.position === 'goleiro' ? 'goleiro' : 'linha') as 'linha' | 'goleiro',
            phone: player.phone || '',
            is_goalkeeper: isGoalkeeper
          },
          statistics: player.statistics !== null ? {
            goals: Number(player.statistics.goals) || 0,
            assists: Number(player.statistics.assists) || 0,
            is_winner: typeof player.statistics.is_winner === 'boolean' 
              ? player.statistics.is_winner 
              : (typeof player.statistics.is_winner === 'number' ? player.statistics.is_winner === 1 : false),
            goals_conceded: isGoalkeeper ? (Number(player.statistics.goals_conceded) || 0) : undefined,
            matchPlayerId: undefined
          } : {
            goals: 0,
            assists: 0,
            is_winner: false,
            goals_conceded: isGoalkeeper ? 0 : undefined,
            matchPlayerId: undefined
          }
        })
      })
    })
  } catch (e: any) {
    if (e?.response?.status === 404) {
      playerStats.value = []
      toast.info('Esta pelada ainda não possui times organizados')
    } else {
      console.error('Erro ao carregar dados da pelada:', e)
      toast.error('Erro ao carregar dados da pelada')
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
    allPeladas.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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

const savePlayerStatistics = async (playerStat: PlayerWithStatistics) => {
  if (!selectedPelada.value) return
  
  isSaving.value = playerStat.player.id
  
  try {
    const statsData: UpdateMatchPlayerRequest = {
      goals: playerStat.statistics.goals || 0,
      assists: playerStat.statistics.assists || 0,
      is_winner: playerStat.statistics.is_winner,
      goals_conceded: playerStat.player.position === 'goleiro'
        ? (playerStat.statistics.goals_conceded || 0) 
        : undefined
    }

    const result = await AdminService.updatePlayerStatistics(
      selectedPelada.value.id,
      playerStat.player.id,
      statsData
    )
    
    if (result?.id) {
      playerStat.statistics.matchPlayerId = result.id
    }
    
    toast.success(`Estatísticas de ${playerStat.player.nickname} salvas com sucesso`)
  } catch (e: any) {
    console.error('Erro ao salvar estatísticas:', e)
    toast.error(`Falha ao salvar estatísticas: ${e?.response?.data?.message || e?.message || 'Erro desconhecido'}`)
  } finally {
    isSaving.value = null
  }
}

onMounted(async () => {
  await loadAllPeladas()
  
  const peladaId = route.query.pelada_id
  if (peladaId) {
    const id = parseInt(String(peladaId))
    if (!isNaN(id)) {
      const peladaExists = allPeladas.value.find(p => p.id === id)
      if (peladaExists) {
        form.value.pelada_id = id
        await loadPeladaById(id)
      } else {
        toast.error('Pelada não encontrada')
      }
    } else {
      toast.error('ID de pelada inválido')
    }
  }
})

watch(() => route.query.pelada_id, async (newPeladaId) => {
  if (newPeladaId) {
    const id = parseInt(String(newPeladaId))
    if (!isNaN(id)) {
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
